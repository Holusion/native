import React from "react";
import { render } from '@testing-library/react-native'

import { H1, ThemeContext } from ".";
import themeStyle from "./theme.style";


describe("H1", () => {
    test("render with default value", () => {
        const res = render(<ThemeContext.Provider value={themeStyle}>
            <H1>Foo</H1>
        </ThemeContext.Provider>);
        expect(res.getByText("Foo")).toBeTruthy();
        expect(res.getByText("Foo").props.style).toEqual([
            {
                "color": themeStyle.color.primary,
                "fontFamily": themeStyle.fontFamily.h1,
                "fontSize": themeStyle.fontSize.h1,
            },
            {}
        ]);
    })
    test("render with color prop", ()=>{
        const res = render(<ThemeContext.Provider value={themeStyle}>
            <H1 color="secondary">Foo</H1>
        </ThemeContext.Provider>);
        expect(res.getByText("Foo").props.style).toEqual([
            {
                "color": themeStyle.color.secondary,
                "fontFamily": themeStyle.fontFamily.h1,
                "fontSize": themeStyle.fontSize.h1,
            },
            {}
        ]);
    });
    test("render with undefined color prop", ()=>{
        const res = render(<ThemeContext.Provider value={themeStyle}>
            <H1 color="foo">Foo</H1>
        </ThemeContext.Provider>);
        expect(res.getByText("Foo").props.style).toEqual([
            {
                "color": undefined,
                "fontFamily": themeStyle.fontFamily.h1,
                "fontSize": themeStyle.fontSize.h1,
            },
            {}
        ]);
    });
    test("render with style props", ()=>{
        const res = render(<ThemeContext.Provider value={themeStyle}>
            <H1 style={{backgroundColor: "red"}}>Foo</H1>
        </ThemeContext.Provider>);
        expect(res.getByText("Foo").props.style).toEqual([
            {
                "color": themeStyle.color.primary,
                "fontFamily": themeStyle.fontFamily.h1,
                "fontSize": themeStyle.fontSize.h1,
            },
            {
                "backgroundColor": "red"
            },
        ]);
    });
    test("Forwards additional props", ()=>{
        const res = render(<ThemeContext.Provider value={themeStyle}>
            <H1 testID="foo">Foo</H1>
        </ThemeContext.Provider>);
        expect(res.getByTestId("foo")).toBeTruthy();
    })
})