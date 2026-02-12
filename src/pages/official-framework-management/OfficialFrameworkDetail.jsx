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
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              handleDownload(framework.fileId, framework.originalFileName)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Icon name="Download" className="w-4 h-4" />
            Download Current
          </button>
        </div>
      </div>

      {/* Framework Basic Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Framework Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Framework ID
            </p>
            <p className="font-mono text-sm text-gray-900 dark:text-white">
              {framework.id}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Framework Name
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {framework.frameworkName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Framework Code
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {framework.frameworkCode}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              File Name
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {framework.originalFileName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              File Type
            </p>
            <FileTypeCard fileType={framework.frameworkType} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              File Size
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {framework.fileSize}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">File ID</p>
            <p className="font-mono text-sm text-gray-900 dark:text-white">
              {framework.fileId}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">File URL</p>
            <p className="font-mono text-xs text-gray-900 dark:text-white break-all">
              {framework.fileUrl}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current Version
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              v{framework.currentVersion}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Uploaded By
            </p>
            <UserMiniCard
              name={framework.uploadedBy?.name}
              email={framework.uploadedBy?.email}
              icon="user"
            />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created At
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(framework.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last Updated
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(framework.updatedAt)}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              File Hash
            </p>
            <p className="font-mono text-xs text-gray-900 dark:text-white break-all">
              {framework.fileHash}
            </p>
          </div>
        </div>
      </div>

      {/* Current Version AI Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Version AI Status (v{framework.currentVersion})
          </h2>
          {(!currentVersionData?.aiUpload ||
            currentVersionData?.aiUpload?.status === "failed") && (
            <button
              onClick={handleUploadToAi}
              disabled={uploadingToAi}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Icon name="Upload" className="w-4 h-4" />
              {uploadingToAi ? "Uploading..." : "Send to AI"}
            </button>
          )}
        </div>

        {currentVersionData?.aiUpload ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <AiUploadStatusCard aiUpload={currentVersionData.aiUpload} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">UUID</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  {currentVersionData.aiUpload.uuid}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Job ID
                </p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  {currentVersionData.aiUpload.job_id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Message
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {currentVersionData.aiUpload.message}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Timestamp
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDate(currentVersionData.aiUpload.timestamp)}
                </p>
              </div>
              {currentVersionData.aiUpload.extraction_reused !== undefined && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Extraction Reused
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {currentVersionData.aiUpload.extraction_reused
                      ? "Yes"
                      : "No"}
                  </p>
                </div>
              )}
              {currentVersionData.aiUpload.original_uuid && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Original UUID
                  </p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {currentVersionData.aiUpload.original_uuid}
                  </p>
                </div>
              )}
            </div>

            {/* Status History */}
            {currentVersionData.aiUpload.status_history && (
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">
                  Status History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Processing Time
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {
                        currentVersionData.aiUpload.status_history
                          .processing_time_seconds
                      }{" "}
                      seconds
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Completed At
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(
                        currentVersionData.aiUpload.status_history.completed_at,
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {currentVersionData.aiUpload.status_history.history?.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white capitalize">
                              {item.status}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(item.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Controls Data */}
            {currentVersionData.aiUpload.controls && (
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">
                  Extracted Controls (
                  {currentVersionData.aiUpload.controls.total_controls})
                </h3>
                <div className="space-y-3">
                  {currentVersionData.aiUpload.controls.controls_data?.map(
                    (control, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                      >
                        <div
                          className="p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          onClick={() =>
                            setExpandedControl(
                              expandedControl === index ? null : index,
                            )
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
                                #{control.Control_id}
                              </span>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {control.Control_name}
                              </h4>
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">
                                {control.Control_type}
                              </span>
                            </div>
                            <Icon
                              name={
                                expandedControl === index
                                  ? "ChevronUp"
                                  : "ChevronDown"
                              }
                              className="w-5 h-5 text-gray-500"
                            />
                          </div>
                        </div>
                        {expandedControl === index && (
                          <div className="p-4 space-y-3 bg-white dark:bg-gray-800">
                            <div>
                              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                Description
                              </p>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {control.Control_description}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                Deployment Points
                              </p>
                              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">
                                {control.Deployment_points}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            This version has not been processed by AI yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default OfficialFrameworkDetail;
