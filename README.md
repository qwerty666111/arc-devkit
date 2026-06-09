# arc-devkit

Frontend toolkit for building dapps on Arc chain — React hooks, contract ABIs, chain config.

## Features

- `useBalance` — fetch ARC and ERC-20 balances
- `useContract` — typed contract instances with ethers.js
- `useBlockNumber` — reactive block number subscription
- `chainConfig` — Arc mainnet/testnet RPCs, explorer URLs, chain IDs
- Pre-compiled ABIs for core Arc contracts

## Install

```bash
npm install arc-devkit ethers
```

## Usage

```tsx
import { useBalance, chainConfig } from 'arc-devkit';
import { JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider(chainConfig.mainnet.rpc);

function Balance({ address }: { address: string }) {
  const { balance, loading } = useBalance(provider, address);
  if (loading) return <span>...</span>;
  return <span>{balance} ARC</span>;
}
```

## License

MIT