# WokFlow

[WokFlow](https://wokflow.xyz) is an open source platform for creating and managing Solana assets—ranging from tokens to NFTs. It leverages decentralized storage via Pinata and connects to Solana through Helius RPC (or your chosen provider).

---

## Features

- **Solana Asset Management:** Create and manage tokens and NFTs.
- **Decentralized Storage:** Integrates with Pinata for file storage.
- **Flexible RPC Integration:** Supports Helius RPC and other providers.

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/wokflow.git
   cd wokflow
   ```

2. **Install dependencies:**

   ```bash
   yarn install
   ```

---

## Setup

1. **Pinata Account:**  
   Sign up at [Pinata](https://pinata.cloud) and get your API credentials.

2. **RPC Provider:**  
   Obtain your Helius RPC URL or another preferred provider.

3. **Configure Environment Variables:**  
   Create a `.env` file in the root directory and add the following:

   ```env
   PINATA_API_KEY=your_pinata_api_key
   PINATA_API_SECRET=your_pinata_api_secret
   NEXT_PUBLIC_RPC_URI=your_rpc_url
   NEXT_PUBLIC_FEE_COLLECTION_WALLET=GsZ6qAWBVch4Q4CCnFDC1Lq3qQ6qQm4pw3y4HTpJxtT1 (you are a G if you keep this)
   NEXT_PUBLIC_NETWORK=devnet/mainnet
   ```

---

## Running the Application

- **Development Mode:**

  ```bash
  yarn run dev
  ```

- **Production Build:**

  ```bash
  yarn build
  yarn start
  ```

---

## Contributing

Contributions are welcome! Please fork the repository, create a new branch for your changes, and submit a pull request.

---

## License

This project is licensed under the MIT License.

---

Happy coding!