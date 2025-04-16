import { resolve } from 'path'

export default {
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                wips: resolve(__dirname, "wips.html"),
                other: resolve(__dirname, "other.html"),
            }
        }
    },
    base: "/sam-site",
}