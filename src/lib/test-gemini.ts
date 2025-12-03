import { AiSummariseCommit } from "./gemini";

async function main() {
  const fakeDiff = `
diff --git a/src/example.ts b/src/example.ts
index 0000000..1111111 100644
--- a/src/example.ts
+++ b/src/example.ts
@@ -1,3 +1,5 @@
-console.log("Hello");
+console.log("Hello, world!");
+console.log("Gemini test");
`;

  try {
    const summary = await AiSummariseCommit(fakeDiff);
    console.log("Gemini summary OK:\n");
    console.log(summary);
  } catch (err) {
    console.error("Gemini test failed:", err);
  }
}

main();


