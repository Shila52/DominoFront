import React, { useEffect, useState } from "react";
import Api from "../../Api";

export default function Dashboard() {
  const getQueryParam = (param) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  };

  const pageFromURL = getQueryParam("page") || 1;
  const [Page, setPage] = useState(pageFromURL);
  const [loading, setloading] = useState(true);
  

  const [Data, setData] = useState([]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", Page);
    window.history.pushState({}, "", "?" + params.toString());
    getPayments();
  }, [Page]);

  const getPayments = async () => {
    const data = await Api.get(`adminorders/payments?page=${Page}&limit=10`);
    setData(data.data);
    setloading(false);
  };

  const UpdatePayments = async (pending, id) => {
    setloading(true);
    await Api.patch("adminorders/payments", {
      data: { pending, id: id },
      credentials: "include",
    });
    await getPayments();
    setloading(false);
  };

  return (
    <div>
      {loading ? null : (
        <div className="overflow-hidden max-w-7xl w-screen rounded-lg border border-gray-200 shadow-md m-5">
            <input className="p-2 my-2 text-center" type="text" placeholder="setcode.." />
          <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">
                  userAddress
                </th>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">
                  State
                </th>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">
                  total_Price
                </th>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">
                  Coins
                </th>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">
                  Created At
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 font-medium text-gray-900"
                ></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-t border-gray-100">
              {Data.data.map((item, i) => {
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <th className="flex gap-3 px-6 py-4 font-normal text-gray-900">
                      <div className="text-sm">
                        <div className="font-medium text-gray-700">
                          {" "}
                          {item.UserAddress}
                        </div>
                      </div>
                    </th>
                    <td className="px-6 py-4">
                      {item.state == "Failed" && (
                        <span className="inline-flex gap-1 items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                          {item.state}
                          <span
                            className={`h-1.5 w-1.5 rounded-full bg-red-700  `}
                          ></span>
                        </span>
                      )}
                      {item.state == "Pending" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                          {item.state}
                          <span
                            className={`h-1.5 w-1.5 rounded-full bg-yellow-700 `}
                          ></span>
                        </span>
                      )}
                      {item.state == "Success" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          {item.state}
                          <span
                            className={`h-1.5 w-1.5 rounded-full bg-green-700  `}
                          ></span>
                        </span>
                      )}
                      {item.state == "Mistake" && (
                        <span className="inline-flex items-center  gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-700/10">
                          {item.state}
                          <span
                            className={`h-1.5 w-1.5 rounded-full bg-orange-700  `}
                          ></span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{item.amount_Price}$</td>
                    <td className="px-6 py-4">{item.amount_Coins}</td>
                    <td className="px-6 py-4">{item.created_at}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-4">
                        {item.state == "Success" ? (
                          <button
                            onClick={() => UpdatePayments("Returned", item._id)}
                          >
                            Return
                          </button>
                        ) : (
                          <div>
                            {" "}
                            <button
                              onClick={() => UpdatePayments("Accept", item._id)}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => UpdatePayments("Failed", item._id)}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            className="disabled:bg-slate-500"
            disabled={Page == 1}
            onClick={() =>
              setPage((prevPage) => (prevPage - 1 <= 1 ? 1 : prevPage - 1))
            }
          >
            Previous
          </button>
          <button
            className="disabled:bg-slate-500"
            disabled={Page == Data.totalPages}
            onClick={() =>
              setPage((prevPage) =>
                prevPage + 1 >= Data.totalPages ? Data.totalPages : prevPage + 1
              )
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
