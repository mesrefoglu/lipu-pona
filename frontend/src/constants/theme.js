import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    styles: {
        global: {
            "@font-face": {
                fontFamily: "FairfaxHD",
                src: "url('/fonts/FairfaxHD.woff2') format('woff2')",
                unicodeRange: "U+F1900-F19FF",
                fontWeight: "normal",
                fontStyle: "normal",
            },
            body: {
                fontFamily: "FairfaxHD, system-ui, sans-serif",
            },
        },
    },
});

export default theme;
