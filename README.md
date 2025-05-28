# SaigonDAO 🇻🇳

<div align="center">
    <img src="./saigon_dao_ui/public/images/logo.png" alt="SaigonDAO Logo"/>
</div>

<h3 align="center">Powering Vietnam's DeFi Ecosystem</h3>

**SaigonDAO is a live, decentralized finance (DeFi) platform meticulously crafted for the Vietnamese market.** It unlocks the latent potential of established, Vietnam-focused tokens like **vBTC** (from Nami Foundation) and **VNST** (from SCI Lab) by integrating them into a powerful suite of DeFi tools. Our mission is to provide accessible, efficient, and localized financial infrastructure, empowering users and fostering innovation within Vietnam's vibrant crypto community.

We bridge the gap between existing assets and cutting-edge DeFi capabilities, offering yield generation, lending, leveraged trading, and more – all centered around the tokens Vietnamese users know and trust.

## ✨ Core Benefits

SaigonDAO creates a synergistic ecosystem where everyone benefits:

### For Liquidity Providers (LPs) 💰

*   **Earn Passive Yield:** Deposit your vBTC and VNST into SaigonDAO's liquidity pools.
*   **Receive Yield-Bearing LSTs:** Get `sgvBTC` and `sgVNST` (Liquid Staking Tokens) representing your share.
*   **Automatic Value Accrual:** Your LSTs automatically increase in value as the protocol earns revenue from lending interest, trading fees, and flash loan fees. No active management needed – just deposit and watch your assets grow!
*   *(Think like Tai: Deposit 1 vBTC and 60M VNST, receive sgvBTC and sgVNST, and later withdraw more than you put in!)*

### For Nami Foundation (vBTC Ecosystem) 📈

*   **Enhanced vBTC Utility:** vBTC becomes a core asset within a versatile DeFi platform, usable as collateral, for borrowing, and trading.
*   **Deepened Liquidity:** SaigonDAO incentivizes holding and depositing vBTC, increasing market depth and stability.
*   **Seamless On-Chain Access:** Our implemented **Custodian Bridge** allows users and Nami Foundation to move vBTC between its off-chain environment and an on-chain ERC-20 representation effortlessly, maintaining value parity.
*   **Increased Demand:** DeFi activities naturally drive demand for vBTC within the ecosystem.

### For SCI Labs (VNST Ecosystem) 📊

*   **Boosted VNST Usage:** VNST serves as the primary stablecoin for pricing, collateral, borrowing, and settling trades within SaigonDAO.
*   **Strengthened Peg & Liquidity:** Increased usage and liquidity pool depth contribute to VNST's stability and accessibility.
*   **New Use Cases:** Provides VNST holders with opportunities for yield generation and participation in advanced DeFi strategies.
*   **Central Role:** Solidifies VNST's position as the go-to stablecoin for DeFi within the Vietnamese market.

### For Vietnam's Decentralized Future 🚀

*   **Localized DeFi Hub:** Provides essential DeFi tools (lending, leverage, yield) tailored to Vietnamese users and tokens, reducing reliance on offshore or complex global platforms.
*   **Financial Inclusion:** Offers sophisticated financial instruments previously inaccessible to many within the traditional banking system.
*   **Capital Efficiency:** Unlocks the value of existing tokens, allowing capital to be used more productively within the local ecosystem.
*   **Innovation Catalyst:** Serves as foundational infrastructure upon which new DeFi applications and services can be built for the Vietnamese market.

## 🎬 Demo Video

[![Watch the Demo Video](https://img.youtube.com/vi/rBF7WXqLfuk/0.jpg)](https://www.youtube.com/watch?v=rBF7WXqLfuk)

## 📸 Screenshots

![image](https://github.com/user-attachments/assets/6e797bf2-c35d-49a6-832d-ee682d35f1fb)

![image](https://github.com/user-attachments/assets/2e72de8b-5b86-4c87-b4e7-fe7b9c069353)

![image](https://github.com/user-attachments/assets/24d39d77-d750-45e4-b951-48ed416de805)

![image](https://github.com/user-attachments/assets/5e65e10e-8186-4488-a867-c205f6ff0485)

## Deep Research, Documentation

Discover the in-depth documentation detailing the journey of creating SaigonDAO. This comprehensive document covers the design principles, technical architecture, and development process that brought the platform to life. Whether you're a developer, investor, or enthusiast, gain valuable insights into the foundation of SaigonDAO.

[Explore the Docs](https://drive.google.com/file/d/1mMpAQmh_DqcoVP0-ZCUGTKAenV5_3oY-/view?usp=sharing)

## 🛠️ Technical Details

*   **Core Tokens:**
    *   `vBTC` (Nami Foundation): Bitcoin representation, primary crypto collateral.
    *   `VNST` (SCI Lab): VND-pegged stablecoin, primary quote and stable asset.
*   **SaigonDAO Native Tokens:**
    *   `sgvBTC` & `sgVNST`: Yield-bearing Liquid Staking Tokens representing deposits.
    *   Position NFTs: Representing isolated margin trading positions (transferable/collateralizable).
*   **Key Infrastructure Components:**
    *   **Custodian Bridge:** Enables seamless, secure movement and minting of on-chain vBTC, maintaining 1:1 value parity with off-chain vBTC via oracles and arbitrage incentives. Features access controls, rate limiting, and circuit breakers.
    *   **Collateralized Lending Protocol:** Borrow vBTC/VNST against each other with transparent LTV ratios and algorithmically determined interest rates.
    *   **Isolated Margin Trading Engine:** Trade vBTC/VNST with up to 10x leverage. Each position is isolated with its own collateral, represented by an NFT.
    *   **Flash Loan Module:** Borrow assets for atomic, single-transaction operations (arbitrage, liquidations, collateral swaps), generating fees for LPs.
    *   **Price Oracle System:** Provides reliable, manipulation-resistant price feeds for vBTC/VNST to ensure accurate liquidations and system stability.
*   **Architecture:** Utilizes the **Facade design pattern** to offer a simplified user experience, abstracting complex interactions while allowing modular upgrades.

### Tech Stack

<div align="center">  
    <img src="https://skillicons.dev/icons?i=git,github,vscode,figma,react,nextjs" alt="Tech stack icons"/> <br>
    <img src="https://skillicons.dev/icons?i=tailwind,ts,solidity" alt="Tech stack icons"/> <br>
</div>

### Core Technologies

- **Git & GitHub**: For version control and collaboration, enabling seamless code management and team workflows.
- **VSCode**: A versatile code editor with extensive extensions, used for writing, debugging, and deploying code across various projects.
- **Figma**: A collaborative design tool for creating high-fidelity UI/UX designs, wireframes, and prototypes for web and mobile applications.
- **React**: A powerful JavaScript library for building dynamic and responsive user interfaces in web applications.
- **Next.js**: A React framework that enables server-side rendering and static site generation for fast and SEO-friendly web applications.
- **Tailwind CSS**: A utility-first CSS framework for designing modern and responsive user interfaces with ease.
- **TypeScript**: A strongly-typed programming language that builds on JavaScript, providing better tooling and maintainability for large-scale projects.

### Blockchain & Web3 Technologies

- **Solidity**: The primary programming language for developing secure and efficient Ethereum-based smart contracts.
- **Foundry**: A smart contract development framework that simplifies testing, debugging, and deploying Solidity contracts.
- **Price Oracle System**: Provides reliable, manipulation-resistant price feeds for vBTC/VNST to ensure accurate liquidations and system stability.

### Infrastructure

- **Frontend Deployment**: Vercel for hosting the Next.js application.
- **Smart Contracts Deployment**: Ethereum blockchain for decentralized execution.
- **Testing Framework**: Forge (Foundry) for comprehensive smart contract testing.

### Tools

- **Package Manager**: pnpm for efficient dependency management.
- **Linting**: ESLint for maintaining code quality and consistency.
- **Formatting**: Prettier for automatic code formatting.

## 🔥 Features

*   ✅ **Deposit & Earn:** Stake vBTC & VNST to receive appreciating sgvBTC & sgVNST.
*   ✅ **Borrow & Lend:** Use vBTC or VNST as collateral to borrow the other asset.
*   ✅ **Leveraged Trading:** Go long or short on vBTC/VNST with up to 10x leverage via isolated margin positions (NFTs).
*   ✅ **Flash Loans:** Access instant, uncollateralized loans for complex DeFi strategies.
*   ✅ **Seamless vBTC:** Move vBTC on-chain and off-chain easily via the Custodian Bridge.
*   ✅ **Vietnam-Focused:** Built specifically for the needs and context of the Vietnamese crypto community.
*   ✅ **Simplified Interface:** Complex DeFi made accessible through thoughtful design (Facade Pattern).

## 📜 Contract Addresses

Here are the deployed contract addresses currently in use on the **Holesky Testnet (Chain ID: 1700)**:

| **Contract**                | **Address**                                   |
|-----------------------------|-----------------------------------------------|
| vBTC                        | `0x7aefae495633112fa8480b15f57c1758df9ec020` |
| VNST                        | `0x327a630fdf431f9788ad64c418cacd30dad5a01f` |
| MockPriceOracle             | `0xbb6be7457e2708837edb1a3b03e547359a7660ca` |
| vBTC_VNST_Vault             | `0x0724aef72348691f2f8924c0ebc5f83200902f1a` |
| SaigonLSTFactory            | `0xec9e0cfcf53dae6c2b99974e77339ee638aff302` |
| SaigonLending               | `0xaa5d80f1562de933a19bf13c4391dc5b6ee9d995` |
| SaigonFacade                | `0x67bd4566effbb7f578ea4af20b02aed1b80e7ee2` |
| sgvBTC                      | `0x34fC1fbE05AfadE837293F1A4eB34E8395B2eB9B` |
| vBTC_Pool                   | `0x65F645Fc9e9F2fa9D92BbFF7c99fBDa06fD002B4` |
| sgVNST                      | `0x90df73b1dfD5b0Ff5fF74D90E0B75c1463371A32` |
| VNST_Pool                   | `0xC163B637aD9Cbc2B53f7161a8CEcaE2f680789b8` |

Feel free to explore these contracts on the [Holesky Etherscan](https://holesky.etherscan.io).

## 🚀 Local Deployment Instructions

To run SaigonDAO locally, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Trong-tra/SaigonDAO.git
   cd SaigonDAO
   ```

2. **Install Dependencies:**
   Ensure you have `pnpm` installed. Then, run:
   ```bash
   pnpm install
   ```

3. **Set Up Environment Variables:**
   Create a `.env` file in the root directory and configure the required environment variables. Refer to `.env.example` if available.

4. **Compile Contracts:**
   Use Foundry to compile the smart contracts:
   ```bash
   forge build
   ```

5. **Run Tests:**
   Execute the test suite to ensure everything is working:
   ```bash
   forge test
   ```

6. **Start the Frontend:**
   Navigate to the `saigon_dao_ui` directory and start the development server:
   ```bash
   cd saigon_dao_ui
   pnpm dev
   ```

7. **Access the Application:**
   Open your browser and navigate to `http://localhost:3000`.

## Contributing 🎮

This project is developed and maintained by **[Trong-tra](https://github.com/Trong-tra)**.

<div align="center">
    <img src="https://emerald-imaginative-dingo-160.mypinata.cloud/ipfs/bafybeieekpq3nrpvbpeqsbi4mzyy2dxdze4cxnebmgjnlbyge6d5roys44" alt="Contributor NFT" width="200"/>
</div>

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request. Showcase your creativity and help shape the future of Vietnam's DeFi ecosystem.
