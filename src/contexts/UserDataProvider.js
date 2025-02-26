import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useCallback,
} from "react";
import { addToCartService } from "../services/cart-services/addToCartService";
import { getCartService } from "../services/cart-services/getCartService";
import { useAuth } from "./AuthProvider.js";
import { getWishlistService } from "../services/wishlist-services/getWishlistService";
import { addToWishlistService } from "../services/wishlist-services/addToWishlistService";
import { removeFromWishlistService } from "../services/wishlist-services/removeFromWishlist";
import { removeFromCartService } from "../services/cart-services/removeFromCartService";
import { getAddressListService } from "../services/address-services/getAddressListService";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { changeQuantityCartService } from "../services/cart-services/changeQuantityCartService";
import { userDataReducer, initialUserData } from "../reducer/userDataReducer";
import { clearCartService } from "../services/cart-services/clearCartService";

const UserDataContext = createContext();

export function UserProvider({ children }) {
  const [cartLoading, setCartLoading] = useState(false);
  const [, setError] = useState("");
  const [userDataState, dispatch] = useReducer(
    userDataReducer,
    initialUserData
  );

  const { auth } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const addToCartHandler = async (product) => {
    if (auth.isAuth) {
      if (!product.is_stock) {
        toast.error(`Sorry, ${product.name} is not in stock.`);
      } else {
        if (!isProductInCart(product)) {
          try {
            setCartLoading(true);
            setError("");
            const response = await addToCartService(product, auth.token);
            if (response.status === 201) {
              setCartLoading(false);
              toast.success(`${product.name} added to cart successfully!`);
              dispatch({ type: "SET_CART", payload: response.data.cart });
            }
          } catch (error) {
            setCartLoading(false);
            console.error(error);
          } finally {
            setCartLoading(false);
          }
        } else {
          navigate("/cart");
        }
      }
    } else {
      toast("Please login first!");
      navigate("/login", { state: { from: location } });
    }
  };

  const addToWishlistHandler = async (product) => {
    const response = await addToWishlistService(product, auth.token);
    dispatch({ type: "SET_WISHLIST", payload: response.data.wishlist });
  };

  const getCartProducts = useCallback(async () => {
    try {
      if (auth.isAuth) {
        setCartLoading(true);
        setError("");
        const response = await getCartService(auth.token);
        if (response.status === 200) {
          dispatch({ type: "SET_CART", payload: response.data.cart });
          setCartLoading(false);
        }
      }
    } catch (error) {
      setCartLoading(false);
      console.error(error);
    } finally {
      setCartLoading(false);
    }
  }, [auth, dispatch, setCartLoading, setError]);

  const removeFromCartHandler = async (product) => {
    try {
      setCartLoading(true);
      setError("");
      const response = await removeFromCartService(product._id, auth.token);
      if (response.status === 200) {
        setCartLoading(false);
        toast.success(`${product.name} successfully removed from the cart `);
        dispatch({ type: "SET_CART", payload: response.data.cart });
      }
    } catch (error) {
      setCartLoading(false);
      console.error(error);
    } finally {
      setCartLoading(false);
    }
  };

  const cartCountHandler = async (product, type) => {
    try {
      setCartLoading(true);
      setError("");
      if (type === "decrement" && product.qty === 1) {
        const response = await removeFromCartService(product._id, auth.token);
        if (response.status === 200) {
          setCartLoading(false);
          toast.success(`${product.name} successfully removed from the cart`);
          dispatch({ type: "SET_CART", payload: response.data.cart });
        }
      } else {
        const response = await changeQuantityCartService(
          product._id,
          auth.token,
          type
        );

        if (response.status === 200) {
          setCartLoading(false);
          if (type === "decrement") {
            toast.success(`Removed one ${product.name} from the cart!`);
          } else {
            toast.success(`Added another ${product.name} to the cart!`);
          }
          dispatch({ type: "SET_CART", payload: response.data.cart });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const wishlistHandler = async (product) => {
    if (auth.isAuth) {
      if (!isProductInWishlist(product)) {
        try {
          setCartLoading(true);
          setError("");
          const response = await addToWishlistService(product, auth.token);
          if (response.status === 201) {
            setCartLoading(false);
            toast.success(
              `${product.name} added to the wishlist successfully!`
            );
            dispatch({ type: "SET_WISHLIST", payload: response.data.wishlist });
          }
        } catch (error) {
          setCartLoading(false);
          console.error(error);
        } finally {
          setCartLoading(false);
        }
      } else {
        try {
          setCartLoading(true);
          setError("");
          const response = await removeFromWishlistService(
            product._id,
            auth.token
          );
          if (response.status === 200) {
            setCartLoading(false);
            toast.success(
              `${product.name} removed from the wishlist successfully!`
            );
            dispatch({ type: "SET_WISHLIST", payload: response.data.wishlist });
          }
        } catch (error) {
          setCartLoading(false);
          console.error(error);
        } finally {
          setCartLoading(false);
        }
      }
    } else {
      toast("Please login first!");
      navigate("/login", { state: { from: location } });
    }
  };

  const getWishlistProducts = useCallback(async () => {
    try {
      const response = await getWishlistService(auth.token);
      dispatch({ type: "SET_WISHLIST", payload: response.data.wishlist });
    } catch (error) {
      console.error(error);
    }
  }, [auth, dispatch]);

  const removeFromWishlistHandler = async (product) => {
    try {
      setCartLoading(true);
      setError("");
      const response = await removeFromWishlistService(product._id, auth.token);
      if (response.status === 200) {
        setCartLoading(false);
        toast.success(
          `${product.name} removed from the wishlist successfully!`
        );
        dispatch({ type: "SET_WISHLIST", payload: response.data.wishlist });
      }
    } catch (error) {
      setCartLoading(false);
      console.error(error);
    } finally {
      setCartLoading(false);
    }
  };

  const isProductInCart = (product) => {
    const found = userDataState.cartProducts.find(
      (item) => item._id === product._id
    );
    return found ? true : false;
  };

  const isProductInWishlist = (product) => {
    const found = userDataState.wishlistProducts.find(
      (item) => item._id === product._id
    );
    return found ? true : false;
  };

  const totalDiscountedPrice = userDataState.cartProducts?.reduce(
    (acc, curr) => acc + curr.discounted_price * curr.qty,
    0
  );

  const totalOriginalPrice = userDataState.cartProducts?.reduce(
    (acc, curr) => acc + curr.original_price * curr.qty,
    0
  );

  const discountPercent = () => {
    const totalPrice = userDataState?.cartProducts?.reduce(
      (acc, curr) => ({
        ...acc,
        original: acc.original + curr.original_price,
        discount: acc.discount + curr.discounted_price,
      }),
      { original: 0, discount: 0 }
    );

    const totalDiscount =
      (totalPrice.original - totalPrice.discount) / totalPrice.original;

    return totalDiscount?.toFixed(2) * 100;
  };

  const clearCartHandler = async (token) => {
    try {
      const response = await clearCartService(token);
      if (response.status === 201) {
        dispatch({ type: "SET_CART", payload: [] });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getAddressList = useCallback(async () => {
    try {
      setCartLoading(true);
      const response = await getAddressListService(auth.token);
      if (response.status === 200) {
        setCartLoading(false);
        dispatch({
          type: "SET_ADDRESS",
          payload: response.data.addressList,
        });
      }
    } catch (error) {
      setCartLoading(false);
      console.error(error);
    } finally {
      setCartLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    getWishlistProducts();
    getCartProducts();
    getAddressList();
  }, [auth, getWishlistProducts, getCartProducts, getAddressList]);

  return (
    <UserDataContext.Provider
      value={{
        userDataState,
        dispatch,
        addToCartHandler,
        addToWishlistHandler,
        removeFromWishlistHandler,
        isProductInCart,
        removeFromCartHandler,
        isProductInWishlist,
        totalDiscountedPrice,
        totalOriginalPrice,
        discountPercent,
        initialUserData,
        wishlistHandler,
        cartCountHandler,
        cartLoading,
        clearCartHandler,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export const useUserData = () => useContext(UserDataContext);
