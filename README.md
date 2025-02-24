# Moonchain Mapper

Moonchain's mapper component, installed using npm:

```sh
npm install @moonchain/react-mapper
```

Use it in any React component:

```tsx
import { Mapper } from '@moonchain/react-mapper'
function App() {
  return (
    <div>
      <Mapper chain={18686} />
    </div>
  )
}

export default App
```

> Please note that this component only supports Moonchain (18686) and Moonchain Geneva (5167004) chains.

## Develop

This project uses `vite` along with `@vitejs/plugin-react` for compilation and is packaged as a library component. You can use the `dev` script for development with the component.

```sh
pnpm dev
```

You will see the following output, and you can click on the local link to browse.

```sh
  VITE v6.1.1  ready in 269 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## Build

Use the `build` script for compilation, which will automatically omit dependencies listed in the `dependencies` field of `package.json`.

```sh
pnpm build
```
