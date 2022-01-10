import React from "react";
import { render } from '@testing-library/react-native'

import { H2, ThemeContext } from ".";
import themeStyle from "./theme.style";



describe("H2", () => {
    test("render with default value", () => {
        const res = render(<ThemeContext.Provider value={themeStyle}>
            <H2>Foo</H2>
        </ThemeContext.Provider>);
        expect(res.getByText("Foo")).toBeTruthy();
        expect(res.getByText("Foo").props.style).toEqual([
            {
                "color": themeStyle.color.secondary,
                "fontFamily": themeStyle.fontFamily.h2,
                "fontSize": themeStyle.fontSize.h2,
            },
            {}
        ]);
    })
    test("render with color prop", ()=>{
        const res = render(<ThemeContext.Provider value={themeStyle}>
            <H2 color="primary">Foo</H2>
        </ThemeContext.Provider>);
        expect(res.getByText("Foo").props.style).toEqual([
            {
                "color": themeStyle.color.primary,
                "fontFamily": themeStyle.fontFamily.h2,
                "fontSize": themeStyle.fontSize.h2,
            },
            {}
        ]);
    });
    test("render with undefined color prop", ()=>{
        const res = render(<ThemeContext.Provider value={themeStyle}>
            <H2 color="foo">Foo</H2>
        </ThemeContext.Provider>);
        expect(res.getByText("Foo").props.style).toEqual([
            {
                "color": undefined,
                "fontFamily": themeStyle.fontFamily.h2,
                "fontSize": themeStyle.fontSize.h2,
            },
            {}
        ]);
    });
    test("render with style props", ()=>{
        const res = render(<ThemeContext.Provider value={themeStyle}>
            <H2 style={{backgroundColor: "red"}}>Foo</H2>
        </ThemeContext.Provider>);
        expect(res.getByText("Foo").props.style).toEqual([
            {
                "color": themeStyle.color.secondary,
                "fontFamily": themeStyle.fontFamily.h2,
                "fontSize": themeStyle.fontSize.h2,
            },
            {
                "backgroundColor": "red"
            },
        ]);
    });
    test("Forwards additional props", ()=>{
      const res = render(<ThemeContext.Provider value={themeStyle}>
          <H2 testID="foo">Foo</H2>
      </ThemeContext.Provider>);
      expect(res.getByTestId("foo")).toBeTruthy();
  })
})