import { useState, useEffect as useAnEffect } from "react";
import * as React from "react";
import { atom } from "recoil";

const myAtom = atom({
    key: "",
    default: "",
});

export const App = () => {
    const [] = useState("");

    useAnEffect(() => {});

    return <div>Application</div>;
};
