import { deepMerge } from ".";

describe("deepMerge", () => {
    let defaultTheme = {
        color:{
            primary: "red",
            secondary: "pink"
        }
    }
    let theme = {
        color:{
            primary: "blue",
        }
    }
    test("theme merge with default theme", () => {
        let mergedTheme = deepMerge(defaultTheme, theme);
        expect(mergedTheme.color.primary).toEqual("blue");
        expect(mergedTheme.color.secondary).toEqual("pink")
    })
    test("can merge if theme is undefined", () => {
        let mergedTheme = deepMerge(defaultTheme, undefined);
        expect(mergedTheme.color.primary).toEqual("red");        
    })
    test("can merge with empty value", () => {
        theme = { color:{ primary: "" }};
        let mergedTheme = deepMerge(defaultTheme, theme);
        expect(mergedTheme.color.primary).toEqual("red");
    })
})
