import { Link } from "react-router-dom";
import { FaHeart, FaMapMarkerAlt, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { useCart } from "./useCart";
import { useToast } from "./useToast";
import { formatCurrency } from "../lib/format";
import type { Product } from "../types/product";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
  // Optional favorite toggle. When provided, a heart button renders
  // over the image (used by Saved / Product Details-style listings).
  isSaved?: boolean;
  onToggleSaved?: (product: Product) => void;
}

export default function ProductCard({
  product,
  isSaved,
  onToggleSaved,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      location: product.location,
      imageUrl: product.imageUrl,
    });
    showToast(`Added "${product.name}" to cart`);
  };

  const detailsHref = `/product-details/${product.id}`;

  return (
    <article className="product-card">
      <div className="product-card-image">
        <Link to={detailsHref}>
          <img src={product.imageUrl || "/placeholder.png"} alt={product.name} />
        </Link>
        {onToggleSaved && (
          <button
            type="button"
            className={`product-card-fav ${isSaved ? "active" : ""}`}
            onClick={() => onToggleSaved(product)}
            aria-label={isSaved ? "Remove from saved" : "Save item"}
          >
            {isSaved ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
      </div>

      <div className="product-card-info">
        <Link to={detailsHref} className="product-card-title">
          {product.name}
        </Link>
        <span className="product-card-price">{formatCurrency(product.price)}</span>
        {product.location && (
          <span className="product-card-meta">
            <FaMapMarkerAlt /> {product.location}
          </span>
        )}
        <button type="button" className="product-card-add" onClick={handleAddToCart}>
          <FaShoppingCart /> Add to Cart
        </button>
      </div>
    </article>
  );
}
