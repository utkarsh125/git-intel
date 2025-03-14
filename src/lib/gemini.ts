import { Document } from "@langchain/core/documents";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

//Adding a note here
//If you go to a github repo URL inside /repo/commit/commitHash.diff
//You will be able to retreive all the information about the commit in raw format
//that thing can be used as a context for Gemini API to work with.
export const AiSummariseCommit = async (diff: string) => {
  // https://github.com/docker/genai-stack/commit/<commitHash>.diff

  const response = await model.generateContent([
    `
        You are an expert programmer, and you are trying to summarize a git diff.
        Reminders about the git diff format:
        For every file, there are a few metadata lines, like (for example):
        \`\`\`
        diff --git a/lib/index.js b/lib/index.js
        index aadf691..bfef603 100644
        --- a/lib/index.js
        +++ b/lib/index.js
        \`\`\`
        This means that \`lib/index.js\` was modified in this commit. Note that this is only an example
        Then there is a specifier of the lines that were modified.
        A line starting with \`+\` means it was added
        A line starting with \`-\` means that line was deleted.
        A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding
        It is not part of the diff.
        [...]
        EXAMPLE SUMMARY COMMENTS:
        \`\`\`
        * Raised the amount of returned recordings for \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
        * Fixed a type in the github action name [.github/workflows/gpt-commit-summarizer.yml]
        * Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
        * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
        * Lowered numeric tolerance for test files
        \`\`\`
        Most commit will have less comments than this examples list.
        The last comment does not include the file names.
        because there were more than two relevant files in the hypothetical commit.
        Do not include parts of the example in your summary.
        It is given only as an example of appropriate comments.`,

    `Please summarise the following diff file: \n\n${diff}`,
  ]);

  return response.response.text();
};

export async function summariseCode(doc: Document) {
  console.log("Getting Summary For: ", doc.metadata.source);
  try {
    const code = doc.pageContent.slice(0, 10000); //limitting to 10k chars
    const response = await model.generateContent([
      `
        You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.
        You are onboarding a junior software engineer and explaining to them the purpose of ${doc.metadata.source} file

        Here is the code
        ---
        ${code}
        ---

        Give a summary no more than 100 words of the code above
        
        `,
    ]);

    return response.response.text();
  } catch (error) {
    console.error("Error while generating summaries: ", error);
  }
}

// console.log(await AiSummariseCommit(
//     `diff --git a/src/app/layout.tsx b/src/app/layout.tsx
// index adc9d71..e93df1b 100644
// --- a/src/app/layout.tsx
// +++ b/src/app/layout.tsx
// @@ -17,8 +17,8 @@ import KBar from "~/components/kbar";
//  import { Toaster } from "sonner";

//  export const metadata: Metadata = {
// -  title: "Create T3 App",
// -  description: "Generated by create-t3-app",
// +  title: "automail | not prod.",
// +  description: "This will not work",
//    icons: [{ rel: "icon", url: "/favicon.ico" }],
//  };

// `
// ))

export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const result = await model.embedContent(summary);

  const embedding = result.embedding;
  return embedding.values;
}

// console.log(await generateEmbedding("Hello World"));
