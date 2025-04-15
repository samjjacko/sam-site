import { resolve } from 'path'

export default {
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                wips: resolve(__dirname, "src/html/wips.html"),
                other: resolve(__dirname, "src/html/other.html"),
            }
        }
    },
    base: "/sam-site",
}