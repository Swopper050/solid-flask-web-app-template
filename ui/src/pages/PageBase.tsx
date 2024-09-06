import { JSXElement } from "solid-js";

import { SideBar } from "../components/SideBar";
import { TopBar } from "../components/TopBar";


export function PageBase(): JSXElement {
  return (
    <>
      <SideBar />
      <TopBar />
    </>
  )
}
