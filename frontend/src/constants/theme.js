import { extendTheme } from "@chakra-ui/react";

const fontStack = "FairfaxHD, system-ui, sans-serif";

const theme = extendTheme({
    fonts: {
        heading: fontStack,
        body: fontStack,
    },
    styles: {
        global: {
            "html, body": { overflowX: "hidden" },
            "@font-face": {
                fontFamily: "FairfaxHD",
                src: "url('/fonts/FairfaxHD.woff2') format('woff2')",
                unicodeRange: "U+F1900-F19FF",
                fontWeight: "normal",
                fontStyle: "normal",
            },
        },
    },
});

export default theme;
