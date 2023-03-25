import { readFile, writeFile } from 'fs/promises';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

import { OPENAI_PROMPT } from './settings';
import { getModelResponse } from './openai-client';

const FRONT_MATTER_REGEX = /---(.*)---/s;
const PAGE_ENCODING = 'utf-8';

class DescriptionResult {
    constructor(page, description) {
        this.page = page;
        this.description = description;
    }
}

const generateDescription = async (page) => {
    const pageContents = await readFile(page, PAGE_ENCODING);
    const rawFrontMatter = pageContents.match(FRONT_MATTER_REGEX)[1];
    const fronMatter = yamlLoad(rawFrontMatter);

    const body = pageContents.replace(FRONT_MATTER_REGEX, '');

    const prompt = OPENAI_PROMPT.replace('{body}', body);
    const description = await getModelResponse(prompt);

    fronMatter.description = description;
    const newPageContents = `---\n${yamlDump(fronMatter)}---\n${body}`;
    await writeFile(page, newPageContents, PAGE_ENCODING);

    return new DescriptionResult(page, description);
};

export const generateDescriptions = async (pages) => {
    const resultTasks = pages.map(async (page) =>
        await generateDescription(page)
    );
    return await Promise.all(resultTasks);
};
