import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import ProductCard from "../Components/ProductCard";
import { useSaved } from "../Components/useSaved";
import { useToast } from "../Components/useToast";
import type { Product } from "../types/product";
import "./SavedPage.css";

export default function SavedPage() {
  const { savedItems, removeSaved } = useSaved();
  const { showToast } = useToast();

  const toProduct = (item: (typeof savedItems)[number]): Product => ({
    id: item.id,
    name: item.name,
    price: item.price,
    imageUrl: item.imageUrl ?? "",
    category: "",
    location: item.location ?? "",
  });

  const handleRemove = (item: (typeof savedItems)[number]) => {
    removeSaved(item.id);
    showToast(`Removed "${item.name}" from saved`, "info");
  };

  return (
    <div className="sv-page">
      <Navbar />

      <div className="sv-page-header">
        <div>
          <h1>Saved</h1>
          <p>Review opportunities saved for later</p>
        </div>
      </div>

      {savedItems.length === 0 ? (
        <div className="sv-empty">
          <p>You haven't saved any items yet.</p>
          <Link to="/shop" className="sv-browse-btn">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="sv-grid">
          {savedItems.map((item) => (
            <ProductCard
              key={item.id}
              product={toProduct(item)}
              isSaved
              onToggleSaved={() => handleRemove(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
