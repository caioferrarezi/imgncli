import React, {
  createContext,
  useContext,
  useState,
  Children,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from "react";

export type RouteState =
  | "input"
  | "loading"
  | "displaying"
  | "error"
  | "history"
  | "viewing"
  | "setup"
  | "models";

interface RouterContextType {
  route: RouteState;
  navigate: (route: RouteState) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a Router");
  }
  return context;
}

// Route component - renders children only when state matches current route
interface RouteProps {
  state: RouteState;
  children: ReactNode;
}

export function Route({ children }: RouteProps) {
  return <>{children}</>;
}

// Router component - manages route state and renders matching Route
interface RouterProps {
  children: ReactNode;
  initialRoute?: RouteState;
}

export function Router({ children, initialRoute = "input" }: RouterProps) {
  const [route, setRoute] = useState<RouteState>(initialRoute);

  function navigate(newRoute: RouteState) {
    setRoute(newRoute);
  }

  function goBack() {
    setRoute("input");
  }

  // Find the matching Route child
  const matchingRoute = Children.toArray(children).find((child) => {
    if (isValidElement(child) && child.type === Route) {
      return (child.props as RouteProps).state === route;
    }
    return false;
  }) as ReactElement<RouteProps> | undefined;

  return (
    <RouterContext.Provider value={{ route, navigate, goBack }}>
      {matchingRoute}
    </RouterContext.Provider>
  );
}
