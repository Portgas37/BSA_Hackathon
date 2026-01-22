# zkPetition Contracts

Smart contracts for the zkPetition platform using o1js.

## Contracts

- **Petition**: Data structure representing a petition (id, title, description, count, status)
- **SignPetitions**: Basic voting contract with nullifier-based double-vote prevention
- **SignPetitionRecursive**: Recursive proof version for batching signatures

## Commands

```bash
npm run build        # Compile TypeScript
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run coverage     # Coverage report
npm run lint         # Lint and fix
npm run format       # Format code
```

## License

Apache-2.0
