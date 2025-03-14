import { Header } from "./common";

function Home() {
  return (
    <main>
      <Header  title="Integration Prototype" />
      <div style={{ height: "16px" }} />
      <div>
        This repo contains sample code to prototype the Baanx + MetaMask Card +
        Daimo Pay integration.
      </div>
      <div style={{ height: "16px" }} />
      <a href="/buy">Buy MetaMask Metal Card</a>
      <div style={{ height: "16px" }} />
      <a href="/deposit">Deposit to MetaMask Card</a>
    </main>
  );
}

export default Home;
