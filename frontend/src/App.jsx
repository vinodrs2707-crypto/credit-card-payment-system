import { useState } from "react";

function App() {
  const [page, setPage] = useState("login");
  const [loggedInUser, setLoggedInUser] = useState("");

  const [username, setUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerUsername, setRegisterUsername] = useState("");
  const [email, setEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [last4, setLast4] = useState("");
  const [cardType, setCardType] = useState("CREDIT");
  const [selectedCard, setSelectedCard] = useState("");
  const [amount, setAmount] = useState("");
  const loadCards = async () => {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/cards/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCards(data);

        if (data.length > 0) {
          setSelectedCard(String(data[0].id));
        }
      } else {
        console.log("Unable to load cards:", data);
      }
    } catch (error) {
      console.log("Error loading cards:", error);
    }
  };
  const handleSaveCard = async () => {
    const token = localStorage.getItem("access_token");

    if (last4.length !== 4) {
      alert("Please enter exactly 4 digits.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/cards/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          last4: last4,
          card_type: cardType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Card saved successfully!");
        setLast4("");
        setCardType("CREDIT");
        await loadCards();
        setPage("cards");
      } else {
        alert("Unable to save card: " + JSON.stringify(data));
      }
    } catch (error) {
      console.log("Error saving card:", error);
      alert("Something went wrong.");
    }
  };
  const handleDeleteCard = async (cardId) => {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/cards/${cardId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Card deleted successfully!");
        await loadCards();
      } else {
        alert("Unable to delete card.");
      }
    } catch (error) {
      console.log("Error deleting card:", error);
      alert("Something went wrong.");
    }
  };
  const handlePayment = async () => {
    const token = localStorage.getItem("access_token");

    if (!selectedCard) {
      alert("Please select a card.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8001/api/payments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card_id: Number(selectedCard),
          amount: Number(amount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `Payment ${data.status}\nReference: ${data.payment_reference}`
        );

        setAmount("");
        setSelectedCard("");
        setPage("dashboard");
      } else {
        alert("Payment failed: " + JSON.stringify(data));
      }
    } catch (error) {
      console.log("Payment error:", error);
      alert("Unable to connect to payment service.");
    }
  };
  const loadTransactions = async () => {
    const token = localStorage.getItem("access_token");

    try {
      const params = new URLSearchParams();

      if (transactionStatus) {
        params.append("status", transactionStatus);
      }

      if (minAmount) {
        params.append("min_amount", minAmount);
      }

      if (maxAmount) {
        params.append("max_amount", maxAmount);
      }

      if (transactionDate) {
        params.append("date", transactionDate);
      }

      const queryString = params.toString();

      let url = "http://127.0.0.1:8000/api/transactions/";

      if (queryString) {
        url += "?" + queryString;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTransactions(data);
      } else {
        console.log("Unable to load transactions:", data);
      }
    } catch (error) {
      console.log("Error loading transactions:", error);
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        const payload = JSON.parse(atob(data.access.split(".")[1]));
        localStorage.setItem("user_id", payload.user_id);

        setLoggedInUser(username);
        setPage("dashboard");
      } else {
        setMessage(data.detail || "Login failed.");
      }
    } catch (error) {
      setMessage("Unable to connect to the Django server.");
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: registerUsername,
            email: email,
            password: registerPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Registration successful! Please login.");
        setRegisterUsername("");
        setEmail("");
        setRegisterPassword("");
        setPage("login");
      } else {
        setMessage(
          data.username?.[0] ||
          data.email?.[0] ||
          data.password?.[0] ||
          "Registration failed."
        );
      }
    } catch (error) {
      setMessage("Unable to connect to the Django server.");
    }

    setLoading(false);
  };
  if (page === "dashboard") {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto">

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Credit Card Payment System
            </h1>

            <p className="text-gray-500 mt-2">
              Welcome, {loggedInUser}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <button
              type="button"
              onClick={() => {
                loadCards();
                setPage("cards");
              }}
              className="bg-white rounded-2xl shadow-lg p-8 text-left hover:shadow-xl"
            >
              <h2 className="text-xl font-bold text-gray-800">
                My Cards
              </h2>
              <p className="text-gray-500 mt-2">
                View and manage your saved cards
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                loadCards();
                setPage("payment");
              }}
              className="bg-white rounded-2xl shadow-lg p-8 text-left hover:shadow-xl"
            >
              <h2 className="text-xl font-bold text-gray-800">
                Make Payment
              </h2>
              <p className="text-gray-500 mt-2">
                Make a credit card payment
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                loadTransactions();
                setPage("transactions");
              }}
              className="bg-white rounded-2xl shadow-lg p-8 text-left hover:shadow-xl"
            >
              <h2 className="text-xl font-bold text-gray-800">
                Transactions
              </h2>
              <p className="text-gray-500 mt-2">
                View your payment history
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                setLoggedInUser("");
                setPage("login");
                setMessage("");
              }}
              className="bg-red-600 text-white rounded-2xl shadow-lg p-8 text-left hover:bg-red-700"
            >
              <h2 className="text-xl font-bold">
                Logout
              </h2>
              <p className="mt-2 text-red-100">
                Sign out of your account
              </p>
            </button>

          </div>
        </div>
      </div>
    );
  }
  if (page === "cards") {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto">

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              My Cards
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your saved credit and debit cards
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800">
              Saved Cards
            </h2>
            <button
              type="button"
              onClick={() => setPage("add-card")}
              className="mt-4 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Add Card
            </button>

            {cards.length === 0 ? (
              <p className="text-gray-500 mt-3">
                No cards added yet.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="border rounded-xl p-4"
                  >
                    <p className="font-semibold text-gray-800">
                      {card.card_type}
                    </p>

                    <p className="text-gray-600 mt-1">
                      {card.masked_card}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.id)}
                      className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setPage("dashboard")}
              className="mt-6 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }
  if (page === "transactions") {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto">

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Transaction History
            </h1>

            <p className="text-gray-500 mt-2">
              View your payment history
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={transactionStatus}
                  onChange={(e) => setTransactionStatus(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">All Statuses</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="FAILED">FAILED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Minimum Amount
                </label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Maximum Amount
                </label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

            </div>

            <div className="flex gap-3 mb-6">

              <button
                type="button"
                onClick={loadTransactions}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Apply Filters
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransactionStatus("");
                  setMinAmount("");
                  setMaxAmount("");
                  setTransactionDate("");

                  setTimeout(() => {
                    loadTransactions();
                  }, 0);
                }}
                className="bg-gray-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-600"
              >
                Clear Filters
              </button>

            </div>

            {transactions.length === 0 ? (
              <p className="text-gray-500">
                No transactions found.
              </p>
            ) : (
              <div className="space-y-4">

                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border rounded-xl p-4"
                  >

                    <div className="flex justify-between items-center">
                      <h2 className="font-bold text-gray-800">
                        Transaction #{transaction.id}
                      </h2>

                      <span className="font-semibold">
                        {transaction.status}
                      </span>
                    </div>

                    <p className="text-gray-600 mt-2">
                      Amount: ₹{transaction.amount}
                    </p>

                    <p className="text-gray-600">
                      Payment Reference: {transaction.payment_reference}
                    </p>

                    <p className="text-gray-500 text-sm mt-2">
                      Date: {transaction.created_at}
                    </p>

                  </div>
                ))}

              </div>
            )}

            <button
              type="button"
              onClick={() => setPage("dashboard")}
              className="mt-6 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Back to Dashboard
            </button>

          </div>
        </div>
      </div>
    );
  }
  if (page === "add-card") {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto">

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h1 className="text-3xl font-bold text-gray-800">
              Add Card
            </h1>

            <p className="text-gray-500 mt-2 mb-6">
              Add a credit or debit card
            </p>

            <input
              type="text"
              placeholder="Last 4 digits"
              maxLength={4}
              value={last4}
              onChange={(e) => setLast4(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 mb-4"
            />

            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 mb-6"
            >
              <option value="CREDIT">Credit Card</option>
              <option value="DEBIT">Debit Card</option>
            </select>

            <div className="flex gap-4">

              <button
                type="button"
                onClick={() => setPage("cards")}
                className="bg-gray-500 text-white px-5 py-3 rounded-lg font-semibold"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSaveCard}
                className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold"
              >
                Save Card
              </button>

            </div>

          </div>

        </div>
      </div>
    );
  }
  if (page === "payment") {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto">

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h1 className="text-3xl font-bold text-gray-800">
              Make Payment
            </h1>

            <p className="text-gray-500 mt-2 mb-6">
              Make a payment using your saved card
            </p>

            <label className="block font-semibold text-gray-700 mb-2">
              Select Card
            </label>

            <select
              value={selectedCard}
              onChange={(e) => setSelectedCard(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 mb-6"
            >
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.card_type} - {card.masked_card}
                </option>
              ))}
            </select>

            <label className="block font-semibold text-gray-700 mb-2">
              Amount
            </label>

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 mb-6"
            />

            <div className="flex gap-4">

              <button
                type="button"
                onClick={() => setPage("dashboard")}
                className="bg-gray-500 text-white px-5 py-3 rounded-lg font-semibold"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handlePayment}
                className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                Pay Now
              </button>

            </div>

          </div>

        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {page === "login" ? (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-800">
              Credit Card Payment
            </h1>

            <p className="text-center text-gray-500 mt-2 mb-8">
              Secure Payment System
            </p>

            <form onSubmit={handleLogin} className="space-y-5">

              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

            </form>

            {message && (
              <p className="text-center mt-5 text-sm">{message}</p>
            )}

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setPage("register");
                  setMessage("");
                }}
                className="text-blue-600 font-semibold"
              >
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-800">
              Create Account
            </h1>

            <p className="text-center text-gray-500 mt-2 mb-8">
              Register for Credit Card Payment
            </p>

            <form onSubmit={handleRegister} className="space-y-5">

              <input
                type="text"
                placeholder="Username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
                required
              />

              <input
                type="password"
                placeholder="Password (minimum 8 characters)"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
                minLength={8}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
              >
                {loading ? "Creating Account..." : "Register"}
              </button>

            </form>

            {message && (
              <p className="text-center mt-5 text-sm">{message}</p>
            )}

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setPage("login");
                  setMessage("");
                }}
                className="text-blue-600 font-semibold"
              >
                Login
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

export default App;