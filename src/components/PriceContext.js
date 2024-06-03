import { createContext } from "react";

const PriceContext = createContext({ price: 0 });
PriceContext.displayName = "HtnPrice";

export default PriceContext;
