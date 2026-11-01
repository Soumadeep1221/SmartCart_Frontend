import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context";
import { useAuth } from "../Context/AuthContext";
import { CATEGORIES, getCategoryLabel } from "../constants/categories";
import { getProductImageUrl } from "../axios";
import { formatCurrency, getStockStatus } from "../utils/formatters";
import unplugged from "../assets/unplugged.png";

const Home = () => {
  const { data, isError, addToCart, updateStockQuantity, selectedCategory, setSelectedCategory } = useContext(AppContext);
  const { user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(null);
  const [notice, setNotice] = useState("");

  const products = selectedCategory ? data.filter((product) => product.category === selectedCategory) : data;

  const handleAddToCart = (event, product) => {
    event.preventDefault();
    if (addingToCart === product.id || product.stockQuantity === 0 || !product.productAvailable) return;
    setAddingToCart(product.id);
    addToCart(product);
    updateStockQuantity(product.id, Math.max(0, product.stockQuantity - 1));
    setNotice(`${product.name} added to your cart`);
    window.setTimeout(() => setNotice(""), 2400);
    window.setTimeout(() => setAddingToCart(null), 450);
  };

  if (isError) {
    return <main className="storefront container text-center py-5"><div className="card p-5"><span className="eyebrow">A small hiccup</span><h1 className="mt-2">We couldn&apos;t load the collection</h1><p>Please try again in a moment.</p><button className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button></div></main>;
  }

  return (
    <main className="storefront container pb-5">
      {notice && <div className="toast app-notification show position-fixed top-0 end-0 m-4" style={{ zIndex: 1055 }}><div className="toast-body"><i className="bi bi-check-circle-fill text-success me-2" />{notice}</div></div>}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div><div className="eyebrow">Good to see you</div><h2 className="mb-0 mt-1">Hello, {user?.name || "there"}.</h2></div>
        <div className="credit-pill"><i className="bi bi-stars" /><strong>{user?.admin ? "Unlimited AI Credits" : `${Number(user?.tokenBalance ?? 0)} AI credits`}</strong></div>
      </div>
      <section className="storefront-hero row align-items-center g-0 mb-5">
        <div className="col-lg-7 p-4 p-md-5 position-relative" style={{ zIndex: 1 }}>
          <div className="eyebrow mb-3">Thoughtful finds, made simple</div>
          <h1 className="display-title mb-3">Shop smarter.<br /><span style={{ color: "var(--terracotta)" }}>Live better.</span></h1>
          <p className="lead mb-4" style={{ maxWidth: "32rem" }}>A warm, intelligent way to discover the things that make everyday life feel a little better.</p>
          <a className="btn btn-primary px-4 py-3" href="#collection">Explore the collection <i className="bi bi-arrow-down-right ms-2" /></a>
        </div>
        <div className="col-lg-5 d-none d-lg-flex justify-content-center align-items-center p-5 position-relative" style={{ zIndex: 1 }}>
          <div className="text-center p-5" style={{ background: "rgba(255,254,252,.72)", borderRadius: "50%", width: 280, height: 280 }}>
            <i className="bi bi-stars" style={{ color: "var(--terracotta)", fontSize: "4rem" }} />
            <h3 className="mt-3 mb-2">Your AI shopping companion</h3>
            <p className="small mb-0">Ask, explore, and find your next favorite.</p>
          </div>
        </div>
      </section>

      <div id="collection" className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div><div className="eyebrow">Curated for you</div><h2 className="mb-0 mt-2">{selectedCategory ? getCategoryLabel(selectedCategory) : "The everyday edit"}</h2></div>
        <span className="text-muted">{products.length} {products.length === 1 ? "item" : "items"}</span>
      </div>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button className={`category-chip ${!selectedCategory ? "active" : ""}`} onClick={() => setSelectedCategory("")}>All products</button>
        {CATEGORIES.map((category) => <button key={category.value} className={`category-chip ${selectedCategory === category.value ? "active" : ""}`} onClick={() => setSelectedCategory(category.value)}>{category.label}</button>)}
      </div>

      {products.length === 0 ? (
        <div className="card text-center p-5"><i className="bi bi-search fs-1" style={{ color: "var(--burnt-orange)" }} /><h3 className="mt-3">Nothing here yet</h3><p>Try another category or browse the full collection.</p></div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
          {products.map((product) => {
            const stock = getStockStatus(product.stockQuantity);
            const unavailable = product.stockQuantity === 0 || !product.productAvailable;
            return (
              <div className="col" key={product.id}>
                <article className={`card product-card h-100 ${unavailable ? "opacity-75" : ""}`}>
                  <Link to={`/product/${product.id}`} className="text-decoration-none">
                    <div className="position-relative overflow-hidden">
                      <img className="w-100 product-image" src={getProductImageUrl(product.id)} alt={product.name} onError={(event) => { event.currentTarget.src = unplugged; }} />
                      {stock.status !== "in-stock" && <span className={`badge position-absolute top-0 end-0 m-3 ${stock.status === "out-of-stock" ? "bg-danger" : "bg-warning"}`}>{stock.message}</span>}
                    </div>
                    <div className="card-body pb-2">
                      <div className="small text-uppercase text-muted mb-1">{product.brand || "SmartCart pick"}</div>
                      <h5 className="mb-2">{product.name}</h5>
                      <div className="price fs-5">{formatCurrency(product.price)}</div>
                    </div>
                  </Link>
                  <div className="card-body pt-2 mt-auto">
                    <button className="btn btn-primary w-100" disabled={unavailable || addingToCart === product.id} onClick={(event) => handleAddToCart(event, product)}>
                      <i className="bi bi-bag-plus me-2" />{addingToCart === product.id ? "Adding..." : unavailable ? "Unavailable" : "Add to cart"}
                    </button>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Home;
