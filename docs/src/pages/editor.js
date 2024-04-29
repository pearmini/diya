import Layout from "@theme/Layout";
import { useState } from "react";
import SplitPane from "react-split-pane";
import MonacoEditor from "react-monaco-editor";
import { useEffect } from "react";
import { useRef } from "react";
import { render } from "bppjs";
import styles from "./editor.module.css";

const defaultCode = `width: 640
height: 640
padding: 10

data:
  - a
  - a1:
      - a11: [h, i, j, k]
      - g
  - a2: [l, m, n, o, p, q, r]

config:
  a1:
    visible: false
    flex: [2, 1]
  a11:
    wrap: 2
    label: group
  a2:
    label: false
`;

function defaultSize() {
  return parseInt(localStorage.getItem("splitPos") ?? document.body.clientWidth * 0.3, 10);
}

export default function Editor() {
  const [leftSize, setLeftSize] = useState(defaultSize());
  const [code, setCode] = useState(defaultCode);
  const diagramRef = useRef(null);

  function onResize(size) {
    setLeftSize(size);
    localStorage.setItem("splitPos", size);
  }

  function onCodeChange(code) {
    setCode(code);
  }

  useEffect(() => {
    try {
      const node = render(code);
      diagramRef.current.innerHTML = "";
      diagramRef.current.appendChild(node);
    } catch (e) {
      console.error(e);
    }
  }, [code]);

  return (
    <Layout>
      <div className={styles.container}>
        <SplitPane split="vertical" defaultSize={leftSize} allowResize={true} onChange={onResize} height="100%">
          <MonacoEditor
            language="yaml"
            width={leftSize}
            options={{
              tabSize: 2,
              minimap: { enabled: false },
              fontSize: 14,
            }}
            value={code}
            onChange={onCodeChange}
          />
          <div className={styles.right}>
            <div className={styles.diagram} ref={diagramRef}></div>
          </div>
        </SplitPane>
      </div>
    </Layout>
  );
}
