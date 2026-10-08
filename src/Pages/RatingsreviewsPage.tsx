import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FC } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../Components/Navbar";
import "./RatingsReviewsPage.css";

import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaRegStar,
} from "react-icons/fa";

type ReviewerRole = "buyer" | "seller";

type TabKey = "all" | "buyers" | "sellers";

type SortKey = "recent" | "oldest" | "highest" | "lowest";

interface Review {
  id: string;
  name: string;
  role: ReviewerRole;
  image: string;
  initials: string;
  avatarColor: string;
  date: string;
  rating: number;
  title: string;
  body: string;
  item?: string;
}

/* =========================================================
   REVIEW DATA
========================================================= */

const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Lerato M.",
    role: "buyer",
    image: "/Lerato.png",
    initials: "LM",
    avatarColor: "#f0b64c",
    date: "2 days ago",
    rating: 5,
    title: "Clear application progress and reminders",
    body:
      "The laptop was in excellent condition and the seller was friendly. Highly recommend!",
    item: "HP EliteBook 840 G5",
  },

  {
    id: "r2",
    name: "Wazeer J.",
    role: "seller",
    image: "/Wazeer.png",
    initials: "WJ",
    avatarColor: "#6c8ec9",
    date: "3 days ago",
    rating: 4,
    title: "Smooth transaction",
    body:
      "Buyer was responsive and the payment was processed quickly. Great experience overall.",
  },

  {
    id: "r3",
    name: "Ayesha D.",
    role: "buyer",
    image: "/Ayesha.png",
    initials: "AD",
    avatarColor: "#c97fb0",
    date: "1 week ago",
    rating: 5,
    title: "Exactly as described",
    body:
      "The product matched the description perfectly. Very happy with my purchase.",
    item: "Wireless Headphones",
  },

  {
    id: "r4",
    name: "Thabo N.",
    role: "seller",
    image: "/Thabo.png",
    initials: "TN",
    avatarColor: "#5aa9a3",
    date: "1 week ago",
    rating: 4,
    title: "Reliable buyer",
    body:
      "Paid on time and picked up promptly. Would gladly sell to again.",
  },

  {
    id: "r5",
    name: "Naledi K.",
    role: "buyer",
    image: "/Naledi.png",
    initials: "NK",
    avatarColor: "#e08a6b",
    date: "2 weeks ago",
    rating: 3,
    title: "Good, but delivery took a while",
    body:
      "Item was fine and as described, just took a bit longer to arrive than expected.",
    item: "Scientific Calculator",
  },

  {
    id: "r6",
    name: "Sipho R.",
    role: "seller",
    image: "/Sipho.png",
    initials: "SR",
    avatarColor: "#8b7fd9",
    date: "3 weeks ago",
    rating: 5,
    title: "Excellent buyer to work with",
    body:
      "Clear communication throughout and collected the item the same day.",
  },
];

/* =========================================================
   RATING SUMMARY
========================================================= */

const OVERALL_RATING = 4.7;
const TOTAL_REVIEWS_COUNT = 128;
const BUYER_REVIEWS_COUNT = 96;
const SELLER_REVIEWS_COUNT = 32;

const RATING_BREAKDOWN = [
  { stars: 5, percent: 82 },
  { stars: 4, percent: 12 },
  { stars: 3, percent: 4 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 1 },
];

const REVIEWS_PER_PAGE = 3;

/* =========================================================
   STAR COMPONENT
========================================================= */

interface StarRowProps {
  rating: number;
  size?: number;
}

const StarRow: FC<StarRowProps> = ({
  rating,
  size = 16,
}) => {
  return (
    <span
      className="star-row"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < Math.floor(rating);

        return isFilled ? (
          <FaStar
            key={index}
            size={size}
            className="star star-filled"
          />
        ) : (
          <FaRegStar
            key={index}
            size={size}
            className="star star-empty"
          />
        );
      })}
    </span>
  );
};

/* =========================================================
   AVATAR COMPONENT
========================================================= */

interface AvatarImgProps {
  src: string;
  alt: string;
  initials: string;
  color: string;
  className: string;
  fallbackClassName: string;
}

const AvatarImg: FC<AvatarImgProps> = ({
  src,
  alt,
  initials,
  color,
  className,
  fallbackClassName,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={fallbackClassName}
        style={{ background: color }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */

const RatingsReviewsPage: FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<TabKey>("all");

  const [sortOrder, setSortOrder] =
    useState<SortKey>("recent");

  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] =
    useState(true);

  /* =======================================================
     LOADING EFFECT
  ======================================================= */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* =======================================================
     FILTER + SORT REVIEWS

     NOTE:
     There is NO search here because the review search
     input was removed from the page.
  ======================================================= */

  const filteredReviews = useMemo<Review[]>(() => {
    let list = [...REVIEWS];

    /* Filter by buyer/seller */
    if (activeTab === "buyers") {
      list = list.filter(
        (review) => review.role === "buyer"
      );
    }

    if (activeTab === "sellers") {
      list = list.filter(
        (review) => review.role === "seller"
      );
    }

    /* Sort reviews */
    switch (sortOrder) {
      case "highest":
        list.sort(
          (a, b) => b.rating - a.rating
        );
        break;

      case "lowest":
        list.sort(
          (a, b) => a.rating - b.rating
        );
        break;

      case "oldest":
        list.reverse();
        break;

      case "recent":
      default:
        /* Keep original order */
        break;
    }

    return list;
  }, [activeTab, sortOrder]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredReviews.length /
        REVIEWS_PER_PAGE
    )
  );

  const pageReviews = filteredReviews.slice(
    (page - 1) * REVIEWS_PER_PAGE,
    page * REVIEWS_PER_PAGE
  );

  /* =======================================================
     TAB CHANGE
  ======================================================= */

  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  /* =======================================================
     PAGINATION CONTROLS
  ======================================================= */

  const previousPage = () => {
    setPage((currentPage) =>
      Math.max(1, currentPage - 1)
    );
  };

  const nextPage = () => {
    setPage((currentPage) =>
      Math.min(
        totalPages,
        currentPage + 1
      )
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="ratings-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar
        userName="Sipho"
        showLinks={true}
      />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="ratings-main">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="ratings-page-heading">

          <div>
            <h1>
              Ratings &amp; Reviews
            </h1>

            <p>
              See feedback from applicants and hiring teams about their
              JobTrack experience.
            </p>
          </div>

          <button
            type="button"
            className="write-review-btn"
            onClick={() =>
              navigate("/write-review")
            }
          >
            <FaStar size={13} />

            Write a Review
          </button>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="ratings-content">

          {/* =================================================
              LEFT - RATING SUMMARY
          ================================================= */}

          <aside className="rating-summary-card">

            <h2>
              Overall Rating
            </h2>

            <div className="rating-summary-score">
              {OVERALL_RATING.toFixed(1)}
            </div>

            <StarRow
              rating={OVERALL_RATING}
              size={22}
            />

            <p className="rating-summary-count">
              Based on{" "}
              {TOTAL_REVIEWS_COUNT} reviews
            </p>

            <div className="rating-breakdown">

              {RATING_BREAKDOWN.map(
                (row) => (
                  <div
                    className="rating-breakdown-row"
                    key={row.stars}
                  >

                    <span className="rating-breakdown-label">
                      {row.stars} Stars
                    </span>

                    <div className="rating-breakdown-track">

                      <div
                        className="rating-breakdown-fill"
                        style={
                          {
                            "--fill-percent": `${row.percent}%`,
                          } as CSSProperties
                        }
                      />

                    </div>

                    <span className="rating-breakdown-percent">
                      {row.percent}%
                    </span>

                  </div>
                )
              )}

            </div>

          </aside>

          {/* =================================================
              RIGHT - REVIEWS
          ================================================= */}

          <section className="reviews-panel">

            {/* =================================================
                REVIEWS HEADER
            ================================================= */}

            <div className="reviews-panel-header">

              <div className="reviews-tabs">

                <button
                  type="button"
                  className={
                    activeTab === "all"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    changeTab("all")
                  }
                >
                  All Reviews(
                  {TOTAL_REVIEWS_COUNT})
                </button>

                <button
                  type="button"
                  className={
                    activeTab === "buyers"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    changeTab("buyers")
                  }
                >
                  From Buyers(
                  {BUYER_REVIEWS_COUNT})
                </button>

                <button
                  type="button"
                  className={
                    activeTab === "sellers"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    changeTab("sellers")
                  }
                >
                  From Sellers(
                  {SELLER_REVIEWS_COUNT})
                </button>

              </div>

              {/* SORT */}

              <div className="reviews-sort">

                <select
                  value={sortOrder}
                  onChange={(event) => {
                    setSortOrder(
                      event.target
                        .value as SortKey
                    );

                    setPage(1);
                  }}
                  aria-label="Sort reviews"
                >

                  <option value="recent">
                    Most Recent
                  </option>

                  <option value="oldest">
                    Oldest
                  </option>

                  <option value="highest">
                    Highest Rated
                  </option>

                  <option value="lowest">
                    Lowest Rated
                  </option>

                </select>

                <FaChevronDown
                  size={11}
                  className="reviews-sort-icon"
                />

              </div>

            </div>

            {/* =================================================
                LOADING STATE
            ================================================= */}

            {isLoading ? (

              <div className="review-list">

                {[1, 2, 3].map(
                  (number) => (
                    <div
                      className="review-card review-skeleton"
                      key={number}
                      aria-hidden="true"
                    >

                      <div className="skeleton-circle" />

                      <div className="skeleton-lines">

                        <div className="skeleton-line skeleton-line-short" />

                        <div className="skeleton-line skeleton-line-medium" />

                        <div className="skeleton-line skeleton-line-long" />

                        <div className="skeleton-line skeleton-line-long" />

                      </div>

                    </div>
                  )
                )}

              </div>

            ) : (

              /* =================================================
                 REVIEW LIST
              ================================================= */

              <div className="review-list">

                {pageReviews.length === 0 && (
                  <p className="review-empty">
                    No reviews found.
                  </p>
                )}

                {pageReviews.map(
                  (review) => (

                    <article
                      className="review-card"
                      key={review.id}
                    >

                      {/* AVATAR */}

                      <AvatarImg
                        src={review.image}
                        alt={`${review.name} profile`}
                        initials={
                          review.initials
                        }
                        color={
                          review.avatarColor
                        }
                        className="review-avatar-img"
                        fallbackClassName="review-avatar-fallback"
                      />

                      {/* REVIEW CONTENT */}

                      <div className="review-content">

                        {/* NAME + ROLE */}

                        <div className="review-meta">

                          <span className="review-name">
                            {review.name}
                          </span>

                          <span
                            className={`review-role review-role-${review.role}`}
                          >
                            {review.role ===
                            "buyer"
                              ? "Buyer"
                              : "Seller"}
                          </span>

                        </div>

                        {/* STARS + DATE */}

                        <div className="review-rating-row">

                          <StarRow
                            rating={
                              review.rating
                            }
                          />

                          <span className="review-date">
                            • {review.date}
                          </span>

                        </div>

                        {/* TITLE */}

                        <h3 className="review-title">
                          {review.title}
                        </h3>

                        {/* BODY */}

                        <p className="review-body">
                          {review.body}
                        </p>

                        {/* ITEM */}

                        {review.item && (
                          <p className="review-item">
                            <strong>
                              Item:
                            </strong>{" "}
                            {review.item}
                          </p>
                        )}

                      </div>

                    </article>

                  )
                )}

              </div>
            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

            {!isLoading &&
              totalPages > 1 && (

                <div className="pagination">

                  {/* PREVIOUS */}

                  <button
                    type="button"
                    onClick={previousPage}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <FaChevronLeft
                      size={12}
                    />
                  </button>

                  {/* PAGE NUMBERS */}

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) =>
                      index + 1
                  ).map((number) => (

                    <button
                      type="button"
                      key={number}
                      className={
                        number === page
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setPage(number)
                      }
                    >
                      {number}
                    </button>

                  ))}

                  {/* NEXT */}

                  <button
                    type="button"
                    onClick={nextPage}
                    disabled={
                      page === totalPages
                    }
                    aria-label="Next page"
                  >
                    <FaChevronRight
                      size={12}
                    />
                  </button>

                </div>
              )}

          </section>

        </div>

      </main>

    </div>
  );
};

export default RatingsReviewsPage;