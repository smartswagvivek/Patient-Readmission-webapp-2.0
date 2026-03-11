import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";

const authState = {
  isAuthenticated: false,
  logout: vi.fn(),
};

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => authState,
}));

describe("Navbar", () => {
  it("shows login and sign in when user is not authenticated", () => {
    authState.isAuthenticated = false;

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Dashboard" })).not.toBeInTheDocument();
  });

  it("shows dashboard and logout when user is authenticated", () => {
    authState.isAuthenticated = true;

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });
});
