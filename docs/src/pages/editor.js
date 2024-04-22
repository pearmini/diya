import Layout from "@theme/Layout";
import { useState } from "react";
import SplitPane from "react-split-pane";
import styled from "styled-components";
import MonacoEditor from "react-monaco-editor";
import { useEffect } from "react";
import { useRef } from "react";
import { render } from "bppjs";

const Container = styled.div`
  background-color: #f6f8fa;
  width: 100%;
  height: calc(100vh - 64px);
  position: relative;
`;

const Right = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Diagram = styled.div`
  width: 80%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const defaultCode = `config:
  width: 640
  height: 480

root:
  - a
  - a1:
    - a11: [h, i, j, k]
    - g
  - a2: [l, m, n, o, p, q, r]

props:
  root:
    direction: column
  a1:
    show: false
    flex: [2, 1]
  a11:
    count: 2
`;

function defaultSize() {
  return parseInt(
    localStorage.getItem("splitPos") ?? document.body.clientWidth * 0.3,
    10
  );
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
      <Container>
        <SplitPane
          split="vertical"
          defaultSize={leftSize}
          allowResize={true}
          onChange={onResize}
          height="100%"
        >
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
          <Right>
            <Diagram ref={diagramRef}></Diagram>
          </Right>
        </SplitPane>
      </Container>
    </Layout>
  );
}
