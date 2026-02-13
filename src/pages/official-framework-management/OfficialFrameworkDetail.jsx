import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Icon from "../../components/Icon";
import {
  getOfficialFrameworkById,
  downloadOfficialFrameworkFile,
  uploadOfficialFrameworkToAi,
} from "../../services/officialFrameworkService";
import { formatDate } from "../../utils/dateFormatter";
import AiUploadStatusCard from "../../components/custom/AiUploadStatusCard";
import UserMiniCard from "../../components/custom/UserMiniCard";
import FileTypeCard from "../../components/custom/FileTypeCard";

function OfficialFrameworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [framework, setFramework] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [uploadingToAi, setUploadingToAi] = useState(false);
  const [expandedControl, setExpandedControl] = useState(null);

  useEffect(() => {
    fetchFrameworkDetails();
  }, [id]);

  const fetchFrameworkDetails = async () => {
    try {
      setLoading(true);
      const response = await getOfficialFrameworkById(id);
      if (response.success) {
        setFramework(response.data.framework);
        const currentVer = response.data.framework.fileVersions?.find(
          (v) => v.version === response.data.framework.currentVersion,
        );
        setSelectedVersion(
          currentVer || response.data.framework.fileVersions?.[0],
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch framework details");
      navigate("/official-frameworks");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      await downloadOfficialFrameworkFile(fileId, fileName);
      toast.success("Download started");
    } catch (error) {
      toast.error(error.message || "Failed to download file");
    }
  };

  const handleUploadToAi = async () => {
    try {
      setUploadingToAi(true);
      const response = await uploadOfficialFrameworkToAi(framework.fileId);
      if (response.success) {
        toast.success(response.message || "File uploaded to AI successfully");
        fetchFrameworkDetails();
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload to AI");
    } finally {
      setUploadingToAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!framework) {
    return null;
  }

  const currentVersionData = framework.fileVersions?.find(
    (v) => v.version === framework.currentVersion,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/official-frameworks")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Icon name="ArrowLeft" className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {framework.frameworkName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {framework.frameworkCode}
            </p>
          </div>
        </div>
        <div className="">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-primary rounded-md cursor-pointer text-white hover:scale-105 duration-300"
          >
            Back
          </button>
        </div>
      </div>
      <div className="mt-10 border border-primary p-10 flex items-center gap-2 text-xl">
        <p>Need to update GUI according to api response</p>
        <picture>
          <source
            srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/512.webp"
            type="image/webp"
          />
          <img
            src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/512.gif"
            alt="🥳"
            width="100"
            height="100"
          />
        </picture>
      </div>
    </div>
  );
}

export default OfficialFrameworkDetail;
