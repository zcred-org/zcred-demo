# ZCred Demo Flow

## Description

The repository demonstrates the effectiveness of the ZCred protocol by
implementing a soul-bound token minting process, one person can have
only one token. Each token is associated with one real person, with help
of passport zk-credential according to ZCIP-2.

The ZCred protocol and zk-credential can be applied beyond token
minting; they address the Sybil Problem. Consequently, they can enhance
authentication processes, voting systems, and various other
applications.

## How to start demo

If you want to start demo, you need:

- node js
- pnpm
- Install this repository

After that, in repository directory run:

```shell script
pnpm install
pnpm run dev
```

Go to [http://localhost:3000/verifier](http://localhost:3000/verifier)
