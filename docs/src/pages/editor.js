import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import clsx from "clsx";
import {useState, useMemo} from "react";
import SplitPane from "react-split-pane";
// import MonacoEditor from "react-monaco-editor";
import {useEffect} from "react";
import {useRef} from "react";
import {render} from "diya-js";
import * as examples from "diya-examples";
import styles from "./editor.module.css";

let MonacoEditor = () => null;
if (ExecutionEnvironment.canUseDOM) {
  MonacoEditor = require("react-monaco-editor").default;
}

function defaultSize() {
  if (!ExecutionEnvironment.canUseDOM) return 100;
  return parseInt(localStorage.getItem("splitPos") ?? document.body.clientWidth * 0.3, 10);
}

export default function Editor() {
  const [leftSize, setLeftSize] = useState(defaultSize());
  const diagramRef = useRef(null);
  const keys = Object.keys(examples);
  const [selectedKey, setSelectedKey] = useState("simpleBlockDiagram");
  const [editorValue, setEditorValue] = useState(null);
  const code = useMemo(() => editorValue ?? examples[selectedKey].trim(), [selectedKey, editorValue]);

  function onResize(size) {
    setLeftSize(size);
    localStorage.setItem("splitPos", size);
  }

  function onSelected(key) {
    setSelectedKey(key);
    setEditorValue(null);
  }

  function onEditorChange(value) {
    setEditorValue(value);
  }

  useEffect(() => {
    try {
      const svg = render(code);
      diagramRef.current.innerHTML = "";
      diagramRef.current.appendChild(svg);

      const [, , width, height] = svg.getAttribute("viewBox").split(" ");
      diagramRef.current.style.width = `${width * 2}px`;
      diagramRef.current.style.height = `${height * 2}px`;
    } catch (e) {
      console.error(e);
    }
  }, [code]);

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.list}>
          {keys.map((key) => (
            <div
              key={key}
              className={clsx(styles.item, selectedKey === key && styles.itemSelected)}
              onClick={() => onSelected(key)}
            >
              {key}
            </div>
          ))}
        </div>
        <div className={styles.main}>
          <SplitPane split="vertical" defaultSize={leftSize} allowResize={true} onChange={onResize} height="100%">
            <BrowserOnly>
              {() => (
                <MonacoEditor
                  language="yaml"
                  width={leftSize}
                  options={{
                    tabSize: 2,
                    minimap: {enabled: false},
                    fontSize: 14,
                  }}
                  value={code}
                  onChange={onEditorChange}
                />
              )}
            </BrowserOnly>
            <div className={styles.right}>
              <div className={styles.diagram} ref={diagramRef}></div>
            </div>
          </SplitPane>
        </div>
      </div>
    </Layout>
  );
}
