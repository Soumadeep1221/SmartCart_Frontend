import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { getProductImageUrl } from "../axios";
import AppContext from "../Context/Context";
import { useAuth } from "../Context/AuthContext";
import unplugged from "../assets/unplugged.png";
import ChatBot from "./ChatBot";

const Navbar = () => {
  const { cart } = useContext(AppContext);
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightedSearch, setHighlightedSearch] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const searchTimer = useRef(null);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const closeMenus = (event) => {
      if (!searchRef.current?.contains(event.target)) setSearchOpen(false);
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => () => window.clearTimeout(searchTimer.current), []);

  const search = async (value) => {
    if (!value.trim()) {
      setResults([]);
      setSearchOpen(false);
      setHighlightedSearch(-1);
      return;
    }
    try {
      const response = await axios.get(`/products/search?keyword=${encodeURIComponent(value)}`);
      setResults(response.data);
      setHighlightedSearch(-1);
      setSearchOpen(true);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setHighlightedSearch(-1);
      setSearchOpen(true);
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setQuery(value);
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => search(value), 280);
  };

  const goToProduct = (id) => {
    setQuery("");
    setSearchOpen(false);
    setHighlightedSearch(-1);
    navigate(`/product/${id}`);
  };

  const handleSearchKeyDown = (event) => {
    if (!searchOpen || !results.length) {
      if (event.key === "Escape") setSearchOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedSearch((current) => (current + 1) % Math.min(results.length, 5));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedSearch((current) => (current <= 0 ? Math.min(results.length, 5) - 1 : current - 1));
    } else if (event.key === "Enter" && highlightedSearch >= 0) {
      event.preventDefault();
      goToProduct(results[highlightedSearch].id);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setSearchOpen(false);
      setHighlightedSearch(-1);
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const visibleResults = results.slice(0, 5);

  return (
    <>
      {!user?.admin && Number(user?.tokenBalance) === 0 && <div className="alert alert-warning text-center rounded-0 mb-0 py-2">Your AI credits are empty. You can still browse and shop as usual.</div>}
      <nav className="navbar navbar-expand-lg fixed-top" ref={searchRef}>
        <div className="container-fluid px-3 px-lg-4">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <span className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: 38, height: 38, background: "var(--primary-light)" }}><i className="bi bi-bag-heart-fill" style={{ color: "var(--terracotta)" }} /></span>
            <span><strong>SmartCart</strong><small className="d-block text-muted" style={{ fontSize: ".65rem", letterSpacing: ".08em" }}>SHOP SMARTER. LIVE BETTER.</small></span>
          </Link>
          <button className="navbar-toggler" type="button" onClick={() => setMobileOpen((open) => !open)} aria-expanded={mobileOpen} aria-label="Toggle navigation"><i className="bi bi-list fs-3" /></button>
          <div className={`${mobileOpen ? "show" : ""} collapse navbar-collapse`}>
            <ul className="navbar-nav me-auto align-items-lg-center gap-lg-1">
              <li className="nav-item"><Link className="nav-link px-3" to="/" onClick={() => setMobileOpen(false)}>Home</Link></li>
              <li className="nav-item"><Link className="nav-link px-3" to="/add_product" onClick={() => setMobileOpen(false)}>Add product</Link></li>
              {user?.admin && <li className="nav-item"><Link className="nav-link px-3" to="/orders" onClick={() => setMobileOpen(false)}>Orders</Link></li>}
            </ul>
            <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2">
              <div className="position-relative">
                <div className="input-group">
                  <span className="input-group-text border-0" style={{ background: "var(--sand)" }}><i className="bi bi-search text-muted" /></span>
                  <input className="form-control border-0" value={query} onChange={handleSearch} onKeyDown={handleSearchKeyDown} onFocus={() => query && setSearchOpen(true)} placeholder="Search products..." aria-label="Search products" aria-controls="search-suggestions" aria-expanded={searchOpen} role="combobox" aria-autocomplete="list" aria-activedescendant={highlightedSearch >= 0 ? `search-option-${visibleResults[highlightedSearch]?.id}` : undefined} />
                </div>
                {searchOpen && <div id="search-suggestions" className="dropdown-menu show search-results position-absolute end-0 w-100" style={{ top: "calc(100% + .5rem)" }} role="listbox" aria-label="Product suggestions">
                  {visibleResults.length ? visibleResults.map((product, index) => <button id={`search-option-${product.id}`} type="button" role="option" aria-selected={index === highlightedSearch} className="dropdown-item d-flex align-items-center gap-2 py-2" key={product.id} onClick={() => goToProduct(product.id)} onMouseEnter={() => setHighlightedSearch(index)}><img src={getProductImageUrl(product.id)} alt="" onError={(event) => { event.currentTarget.src = unplugged; }} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 8 }} /><span className="text-truncate">{product.name}</span></button>) : <span className="dropdown-item-text text-muted">No products found</span>}
                </div>}
              </div>
              <Link className="btn btn-primary position-relative px-3" to="/cart"><i className="bi bi-bag me-2" />Cart{cartCount > 0 && <span className="badge rounded-pill bg-light text-dark ms-2">{cartCount}</span>}</Link>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setChatOpen(true)}><i className="bi bi-stars me-1" />Ask AI</button>
              <div className="position-relative ms-lg-2" ref={profileRef}>
                <button type="button" className="profile-trigger" aria-expanded={profileOpen} aria-haspopup="menu" onClick={() => setProfileOpen((open) => !open)}>
                  <img
                    src={user?.pictureUrl || unplugged}
                    alt=""
                    className="rounded-circle"
                    onError={(event) => { event.currentTarget.src = unplugged; }}
                  />
                  <span className="d-none d-xl-block text-start"><strong>{user?.name || "Your account"}</strong><small>{user?.admin ? "Admin" : "Member"}</small></span>
                  <i className="bi bi-chevron-down" />
                </button>
                {profileOpen && <div className="profile-menu" role="menu">
                  <div className="profile-menu-heading"><strong>{user?.name || "SmartCart member"}</strong><span>{user?.admin ? "Admin account" : "Personal account"}</span></div>
                  <div className="profile-credit"><i className="bi bi-stars" /><span>{user?.admin ? "Unlimited AI Credits" : `${Number(user?.tokenBalance ?? 0)} AI credits remaining`}</span></div>
                  <button type="button" className="profile-signout" role="menuitem" onClick={() => { setProfileOpen(false); logout(); }}><i className="bi bi-box-arrow-right" /> Sign out</button>
                </div>}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <ChatBot open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default Navbar;
