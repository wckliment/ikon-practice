import React from "react";
import RequestCardList from "./Requests/RequestCardList";

export default function AllRequestsTab(props) {
  return (
    <div className="mt-6 ml-20 mr-[500px] max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-12 mt-4">All Requests</h2>
      <RequestCardList {...props} />
    </div>
  );
}
