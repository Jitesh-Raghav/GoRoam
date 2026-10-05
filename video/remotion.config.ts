import { Config } from "@remotion/cli/config";

// The film reuses GoRoam's own drawing code (../src/components/scenes), so its
// monuments and landscapes match the site exactly.
Config.setEntryPoint("./src/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setAudioCodec("aac");
Config.setOverwriteOutput(true);
// Each worker is a Chrome tab holding full-HD frames; 3 keeps an 8 GB machine
// out of memory. Raise it on a bigger box: REMOTION_CONCURRENCY=6 npm run render:all
Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCY) || 3);
