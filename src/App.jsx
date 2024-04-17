import styled from "styled-components";
import { Playground } from "./Playground";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background-color: #f6f8fa;
  padding: 16px;
  box-shadow: rgb(208, 215, 222) 0px -1px 0px 0px inset;
  height: 64px;
  display: flex;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 16px;
`;

function App() {
  return (
    <Container>
      <Header>
        <Title>ArchiMaker</Title>
      </Header>
      <Playground></Playground>
    </Container>
  );
}

export default App;
