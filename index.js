import { setFailed } from '@actions/core';

import { getChangedFiles } from './src/changed-files.js';
import { generateReport } from './src/report.js';
import { createCommit, createComment } from './src/github.js';
import { generateDescriptions } from './src/generator.js';

const run = async () => {
    try {
        const changedFiles = await getChangedFiles();
        const results = await generateDescriptions(changedFiles);
        const reportContent = await generateReport(results);

        await createCommit(changedFiles);
        await createComment(reportContent);
    } catch (error) {
        console.error(error);
        setFailed(error.message);
        throw error;
    }
};

run();
