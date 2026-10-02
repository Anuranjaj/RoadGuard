import { useEffect, useState } from "react";
import { partnerApi, requestApi, serviceApi } from "@/services/api";
import { normalizePartnerRequest } from "@/utils/partnerData";

export function usePartnerWorkspace() {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError("");

    Promise.all([partnerApi.me(), requestApi.list(), serviceApi.list()])
      .then(([profileResponse, requestResponse, serviceResponse]) => {
        if (!isActive) return;
        const partner = profileResponse.data;
        const serviceList = serviceResponse.data || [];
        setProfile(partner);
        setServices(serviceList);
        setRequests(
          (requestResponse.data || []).map((request) =>
            normalizePartnerRequest(request, serviceList, partner.location),
          ),
        );
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message || "Unable to load partner data.");
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  return {
    profile,
    requests,
    services,
    loading,
    error,
    refresh: () => setRefreshKey((current) => current + 1),
  };
}