# SaigonDAO 🇻🇳

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

*(Link to Demo Video Coming Soon!)*

## 📸 Screenshots

*(Screenshots of the Platform Coming Soon!)*

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

## 🔥 Features

*   ✅ **Deposit & Earn:** Stake vBTC & VNST to receive appreciating sgvBTC & sgVNST.
*   ✅ **Borrow & Lend:** Use vBTC or VNST as collateral to borrow the other asset.
*   ✅ **Leveraged Trading:** Go long or short on vBTC/VNST with up to 10x leverage via isolated margin positions (NFTs).
*   ✅ **Flash Loans:** Access instant, uncollateralized loans for complex DeFi strategies.
*   ✅ **Seamless vBTC:** Move vBTC on-chain and off-chain easily via the Custodian Bridge.
*   ✅ **Vietnam-Focused:** Built specifically for the needs and context of the Vietnamese crypto community.
*   ✅ **Simplified Interface:** Complex DeFi made accessible through thoughtful design (Facade Pattern).

## Contributing 🎮

This project is developed and maintained by **[Trong-tra](https://github.com/Trong-tra)**.

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.
