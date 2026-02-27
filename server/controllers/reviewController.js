import Review from '../models/Review.js';
import Product from '../models/Product.js';


export const addOrUpdateReview = async (req, res) => {
  try {
    const { productId, rating, comment, experience } = req.body;
    const userId = req.user._id;

    let review = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      review.experience = experience;
      await review.save();
    } else {
      review = await Review.create({
        product: productId,
        user: userId,
        rating,
        comment,
        experience,
      });
    }

    // Recalculate rating
    const reviews = await Review.find({ product: productId });

    const totalReviews = reviews.length;
    const averageRating =
      reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews;

    const goodCount = reviews.filter(r => r.experience === "good").length;
    const badCount = reviews.filter(r => r.experience === "bad").length;

    await Product.findByIdAndUpdate(productId, {
      averageRating,
      totalReviews,
      goodCount,
      badCount,
    });

    res.json({ message: "Review saved successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Reviews by Product
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    }).populate("user", "name");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// Get Reviews for Vendor (his/her products ke reviews)
export const getVendorReviews = async (req, res) => {
  try {
    const vendorId = req.user._id;  // better to use _id consistently

    // Step 1: Find all products of this vendor
    const vendorProducts = await Product.find(
      { vendor: vendorId },           // assuming field is 'vendor' in Product
      { _id: 1 }
    );

    if (vendorProducts.length === 0) {
      return res.json([]);
    }

    const productIds = vendorProducts.map(p => p._id);

    // Step 2: Find all reviews for those products
    const reviews = await Review.find({
      product: { $in: productIds }
    })
      .populate("product", "title image")   // title instead of name
      .populate("user", "name email")       // more info if needed
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);
  } catch (error) {
    console.error("getVendorReviews error:", error);
    res.status(500).json({ message: "Failed to fetch vendor reviews" });
  }
};