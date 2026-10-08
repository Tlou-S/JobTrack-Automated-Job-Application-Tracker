import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "./ProductDetailsPage.css";
import {
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaStar,
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaThumbsUp,
  FaThumbsDown,
} from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../Components/useCart";
import { useToast } from "../Components/useToast";
import { formatCurrency } from "../lib/format";

interface Product {
  id: string | number;
  name: string;
  category: string;
  price: number;
  image: string;
  brand?: string;
  description?: string;
  available?: number;
  colors?: string[];
  sizes?: string[];
}

interface Review {
  id?: string;
  name: string;
  date: string;
  rating: number;
  comment: string;
  helpful?: number;
  user_id?: string | null;
}

// Map a Supabase "Products" row → Product interface
function mapProductRow(row: any): Product {
  return {
    id: row.id,
    name: row.name ?? "",
    category: row.category ?? "",
    price: Number(row.price ?? 0),
    image: row.image_url ?? "",
    brand: row.brand ?? "",
    description: row.description ?? "",
    available: row.quantity ?? 0,
  };
}

export default function ProductDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const passedProduct = (location.state as { product?: Product })?.product;

  const [product, setProduct] = useState<Product | null>(
    passedProduct ?? null
  );
  const [loadingProduct, setLoadingProduct] = useState(!passedProduct);
  const [notFound, setNotFound] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);

  // ── Favorites ────────────────────────────────────────────
  const [isSaved, setIsSaved] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  // ── Reviews ──────────────────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // ── 1. Fetch the product whenever the id changes ─────────
  useEffect(() => {
    let cancelled = false;

    // Use navigation state if it matches the route
    if (passedProduct && String(passedProduct.id) === String(routeId)) {
      setProduct(passedProduct);
      setLoadingProduct(false);
      setNotFound(false);
      return;
    }

    // No id in URL and no passed product → not found
    if (!routeId) {
      setProduct(null);
      setLoadingProduct(false);
      setNotFound(true);
      return;
    }

    (async () => {
      setLoadingProduct(true);
      setNotFound(false);

      const { data, error } = await supabase
        .from("Products")
        .select("*")
        .eq("id", routeId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch product:", error);
        setNotFound(true);
        setProduct(null);
      } else if (!data) {
        setNotFound(true);
        setProduct(null);
      } else {
        const mapped = mapProductRow(data);
        console.log("Fetched product:", mapped);
        console.log("Image URL:", mapped.image);
        setProduct(mapped);
      }
      // } else {
      //   setProduct(mapProductRow(data));
      // }

      setLoadingProduct(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [routeId, passedProduct]);

  // ── 2. Load favorite + reviews whenever product.id changes ─
  useEffect(() => {
    if (!product) return;
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: favRow } = await supabase
          .from("Favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", String(product.id))
          .maybeSingle();
        if (!cancelled) setIsSaved(!!favRow);
      } else {
        if (!cancelled) setIsSaved(false);
      }

      const { data: rows } = await supabase
        .from("Reviews")
        .select("*")
        .eq("product_id", String(product.id))
        .order("created_at", { ascending: false });

      if (cancelled) return;

      setReviews(
        (rows ?? []).map((r: any) => ({
          id: r.id,
          name: r.user_name || "Anonymous",
          date: new Date(r.created_at).toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          rating: r.rating,
          comment: r.comment,
          helpful: r.helpful ?? 0,
          user_id: r.user_id,
        }))
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  // ── Handlers ─────────────────────────────────────────────
  const handleQuantityChange = (action: "increase" | "decrease") => {
    if (!product) return;
    const max = product.available ?? 0;
    if (action === "increase" && quantity < max) {
      setQuantity(quantity + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(
      {
        id: String(product.id),
        name: product.name,
        price: product.price,
        category: product.category,
        imageUrl: product.image,
      },
      quantity
    );
    showToast(`Added "${product.name}" to cart`);
    navigate("/cart");
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(
      {
        id: String(product.id),
        name: product.name,
        price: product.price,
        category: product.category,
        imageUrl: product.image,
      },
      quantity
    );
    navigate("/checkout");
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    setSavingFavorite(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsSaved((prev) => !prev);
        return;
      }

      if (isSaved) {
        await supabase
          .from("Favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", String(product.id));
        setIsSaved(false);
        showToast(`Removed "${product.name}" from saved`, "info");
      } else {
        await supabase.from("Favorites").insert({
          user_id: user.id,
          product_id: String(product.id),
        });
        setIsSaved(true);
        showToast(`Saved "${product.name}"`);
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
      setIsSaved((prev) => !prev);
    } finally {
      setSavingFavorite(false);
    }
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setReviewError(null);
    setReviewSuccess(false);

    if (myRating < 1 || myRating > 5) {
      setReviewError("Please select a star rating.");
      return;
    }
    if (!myComment.trim()) {
      setReviewError("Please write a short comment.");
      return;
    }

    setSubmittingReview(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: inserted, error } = await supabase
        .from("Reviews")
        .insert({
          product_id: String(product.id),
          user_id: user?.id ?? null,
          user_name: user?.email?.split("@")[0] || "Anonymous",
          rating: myRating,
          comment: myComment.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setReviews((prev) => [
        {
          id: inserted.id,
          name: inserted.user_name || "Anonymous",
          date: new Date(inserted.created_at).toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          rating: inserted.rating,
          comment: inserted.comment,
          helpful: 0,
          user_id: inserted.user_id,
        },
        ...prev,
      ]);

      setMyRating(0);
      setHoverRating(0);
      setMyComment("");
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error("Review submit failed:", err);
      setReviewError(
        err instanceof Error ? err.message : "Could not post your review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHelpful = (index: number, direction: "up" | "down") => {
    setReviews((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
            ...r,
            helpful:
              direction === "up"
                ? (r.helpful ?? 0) + 1
                : Math.max(0, (r.helpful ?? 0) - 1),
          }
          : r
      )
    );
  };

  // Derived
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  // ── Loading state ────────────────────────────────────────
  if (loadingProduct) {
    return (
      <div className="productDetailsContainer">
        <Navbar />
        <div className="productDetailsWrapper">
          <div className="productLoadingState">
            <div className="spinner" />
            <p>Loading product…</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Not found state ──────────────────────────────────────
  if (notFound || !product) {
    return (
      <div className="productDetailsContainer">
        <Navbar />
        <div className="productDetailsWrapper">
          <div className="productNotFoundState">
            <h2>Product not found</h2>
            <p>
              We couldn't find that product. It may have been removed or the
              link is incorrect.
            </p>
            <Link to="/products" className="backToProductsBtn">
              <FaArrowLeft /> Back to products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="productDetailsContainer">
      <Navbar />

      <div className="productDetailsWrapper">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/categories" className="breadcrumbLink">
            <FaArrowLeft /> Back to Categories
          </Link>
          <span className="breadcrumbSeparator">/</span>
          <Link to="/categories" className="breadcrumbLink">
            {product.category || "Products"}
          </Link>
          <span className="breadcrumbSeparator">/</span>
          <span className="breadcrumbCurrent">{product.name}</span>
        </div>

        <div className="productDetailGrid">
          {/* Left Column - Image */}
          <div className="productImageWrapper">
            <img
              src={product.image || "/placeholder.png"}
              alt={product.name}
              className="productMainImage"
            />
          </div>

          {/* Right Column - Product Info */}
          <div className="productInfoWrapper">
            <div className="stockBadge">
              <span className="stockDot"></span>
              In stock
            </div>

            <div className="titleRow">
              <div>
                {product.brand && (
                  <div className="brandName">{product.brand}</div>
                )}
                <h1 className="productDetailTitle">{product.name}</h1>
              </div>

              <button
                type="button"
                className={`favoriteBtn ${isSaved ? "saved" : ""}`}
                onClick={handleToggleFavorite}
                disabled={savingFavorite}
                aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
                title={isSaved ? "Saved" : "Save to favorites"}
              >
                {isSaved ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

            <div className="productDetailPrice">
              {formatCurrency(product.price)}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="colorSection">
                <span className="sectionLabel">Colors:</span>
                <div className="colorOptions">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      className={`colorDot ${selectedColor === index ? "active" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(index)}
                      aria-label={`Color ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="sizeSection">
                <div className="sizeHeader">
                  <span className="sectionLabel">Select size:</span>
                  <span className="sizeGuide">Choose your size</span>
                </div>
                <div className="sizeOptions">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`sizeButton ${selectedSize === size ? "active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="quantitySection">
              <span className="sectionLabel">Quantity:</span>
              <div className="quantityControls">
                <button
                  className="quantityButton"
                  onClick={() => handleQuantityChange("decrease")}
                  disabled={quantity <= 1}
                >
                  <FaMinus />
                </button>
                <span className="quantityDisplay">{quantity}</span>
                <button
                  className="quantityButton"
                  onClick={() => handleQuantityChange("increase")}
                  disabled={quantity >= (product.available ?? 0)}
                >
                  <FaPlus />
                </button>
              </div>
              {typeof product.available === "number" && (
                <span className="availableStock">
                  available: {product.available}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="actionButtons">
              <button className="addToCartBtn" onClick={handleAddToCart}>
                <FaShoppingCart /> Add to cart
              </button>
              <button className="buyNowBtn" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>

            <div className="tabSection">
              <button className="tabButton active">Description</button>
            </div>

            <div className="descriptionText">
              {product.description || "No description provided."}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviewsSection">
          <div className="reviewsHeader">
            <h3>Reviews ({reviewCount})</h3>
            <div className="ratingSummary">
              {reviewCount > 0 && (
                <>
                  <span className="averageRating">
                    {averageRating.toFixed(1)}/5
                  </span>
                  <div className="starDisplay">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < Math.round(averageRating) ? "filled" : "empty"
                        }
                      />
                    ))}
                  </div>
                </>
              )}
              <span className="reviewCount">({reviewCount} reviews)</span>
            </div>
          </div>

          {/* Write a review */}
          <form className="reviewForm" onSubmit={handleSubmitReview}>
            <h4>Write a review</h4>

            <div className="reviewFormStars">
              <span className="sectionLabel">Your rating:</span>
              <div className="starPicker">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`starPickerBtn ${(hoverRating || myRating) >= star ? "active" : ""
                      }`}
                    onClick={() => setMyRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="reviewTextarea"
              placeholder="Share your experience with this product..."
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              rows={3}
            />

            {reviewError && <div className="reviewError">{reviewError}</div>}
            {reviewSuccess && (
              <div className="reviewSuccess">
                Thanks! Your review was posted.
              </div>
            )}

            <button
              type="submit"
              className="submitReviewBtn"
              disabled={submittingReview}
            >
              {submittingReview ? "Posting..." : "Post review"}
            </button>
          </form>

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <p className="noReviews">No reviews yet. Be the first!</p>
          ) : (
            reviews.map((review, index) => (
              <div key={review.id ?? index} className="reviewCard">
                <div className="reviewHeader">
                  <span className="reviewerName">{review.name}</span>
                  <span className="reviewDate">{review.date}</span>
                </div>
                <div className="reviewStars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < review.rating ? "filled" : "empty"}
                    />
                  ))}
                </div>
                <p className="reviewComment">{review.comment}</p>
                <div className="reviewHelpful">
                  Was this review helpful to you?
                  <button
                    type="button"
                    className="helpfulBtn"
                    onClick={() => handleHelpful(index, "up")}
                  >
                    <FaThumbsUp /> Yes
                  </button>
                  <button
                    type="button"
                    className="helpfulBtn"
                    onClick={() => handleHelpful(index, "down")}
                  >
                    <FaThumbsDown /> No
                  </button>
                  {review.helpful !== undefined && review.helpful > 0 && (
                    <span className="helpfulCount">{review.helpful}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}