import "./Products.css";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import ProductCard from "../Components/ProductCard";
import { supabase } from "../lib/supabaseClient";
import { mapProductRow } from "../lib/products";
import type { Product } from "../types/product";

type SortOption =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data + loading state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [query, setQuery] = useState("");
  // Seeded from ?category= so links from the Categories page land
  // pre-filtered here instead of showing everything.
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [province, setProvince] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const selectCategory = (value: string) => {
    setCategory(value);
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set("category", value);
    } else {
      next.delete("category");
    }
    setSearchParams(next, { replace: true });
  };

  // Controls whether the filter panel is visible
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      let request = supabase.from("Products").select("*");
      

      // Only show active listings
      request = request.eq("is_active", true);

      // Search — case-insensitive match against name OR description
      if (query.trim()) {
        const q = `%${query.trim()}%`;
        request = request.or(`name.ilike.${q},description.ilike.${q}`);
      }

      // Exact-match filters
      if (category) request = request.eq("category", category);
      if (brand) request = request.eq("brand", brand);
      if (condition) request = request.eq("condition", condition);
      if (province) request = request.eq("province", province);

      // Sorting
      switch (sort) {
        case "newest":
          request = request.order("created_at", { ascending: false });
          break;
        case "oldest":
          request = request.order("created_at", { ascending: true });
          break;
        case "price-asc":
          request = request.order("price", { ascending: true });
          break;
        case "price-desc":
          request = request.order("price", { ascending: false });
          break;
        case "name-asc":
          request = request.order("name", { ascending: true });
          break;
      }

      const { data, error: fetchError } = await request;

      if (fetchError) {
        console.error(fetchError);
        setError(fetchError.message);
        setProducts([]);
      } else {
        setProducts((data ?? []).map(mapProductRow));
      }

      setLoading(false);
    };

    // Debounce so we don't hammer the DB on every keystroke
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [query, category, brand, condition, province, sort]);

  // Search form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect above re-runs whenever `query` changes,
    // but this also forces an immediate refetch on submit.
    setQuery((q) => q); // no-op trigger — replace with explicit refetch if needed
  };

  // Clear all filters
  const clearFilters = () => {
    setQuery("");
    selectCategory("");
    setBrand("");
    setCondition("");
    setProvince("");
    setSort("newest");
  };

  const activeFilterCount = [category, brand, condition, province].filter(
    Boolean
  ).length;

  return (
    <div className="productsContainer">
      <Navbar />

      <section className="productsMainSection">
        <div className="productsTopsection">
          <div className="productsTopsectionContainer">
            <h1>Browse Listed Products</h1>
            <p>Find the exact product you need from sellers on our marketplace.</p>
          </div>

          <div className="filterContainer">
            {/* Top row: search + filter toggle */}
            <div className="filterTopRow">
              <form className="productSearch-bar" onSubmit={handleSearch}>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">Search</button>
              </form>

              <button
                type="button"
                className={`filterToggleBtn ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters((s) => !s)}
              >
                <FaFilter />
                Filters
                {activeFilterCount > 0 && (
                  <span className="filterBadge">{activeFilterCount}</span>
                )}
              </button>
            </div>

            {/* Expandable filter panel */}
            {showFilters && (
              <div className="filterPanel">
                <div className="filterGroup">
                  <label>Category</label>
                  <select
                    value={category}
                    onChange={(e) => selectCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option>Books</option>
                    <option>Clothes</option>
                    <option>Electronics</option>
                    <option>Bedding</option>
                    <option>Kitchen</option>
                    <option>Toys & Games</option>
                    <option>Sports & Outdoor</option>
                    <option>Furniture</option>
                    <option>Home</option>
                    <option>Jewelry</option>
                    <option>Office</option>
                    <option>Food</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="filterGroup">
                  <label>Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  >
                    <option value="">All Brands</option>
                    <option>Adidas</option>
                    <option>Asus</option>
                    <option>Sumsung</option>
                    <option>Merce</option>
                    <option>Relay</option>
                    <option>Lenovo</option>
                    <option>Apple</option>
                    <option>Puma</option>
                    <option>HP</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="filterGroup">
                  <label>Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="">Any Condition</option>
                    <option>New</option>
                    <option>Like New</option>
                    <option>Used</option>
                    <option>Refurbished</option>
                  </select>
                </div>

                <div className="filterGroup">
                  <label>Province</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  >
                    <option value="">All Provinces</option>
                    <option>Western Cape</option>
                    <option>Gauteng</option>
                    <option>KwaZulu-Natal</option>
                    <option>Eastern Cape</option>
                    <option>Free State</option>
                    <option>Limpopo</option>
                    <option>Mpumalanga</option>
                    <option>North West</option>
                    <option>Northern Cape</option>
                  </select>
                </div>

                <div className="filterGroup">
                  <label>Sort By</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A - Z</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="clearFiltersBtn"
                  onClick={clearFilters}
                >
                  <FaTimes /> Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Results ── */}
        <div className="productsGrid">
          {loading && <p className="productsStatus">Loading products…</p>}

          {!loading && error && (
            <p className="productsStatus productsError">
              Failed to load products: {error}
            </p>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="productsStatus">No products match your filters.</p>
          )}

          {!loading &&
            !error &&
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Products;