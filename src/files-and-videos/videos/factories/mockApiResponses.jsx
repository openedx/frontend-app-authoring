import { RequestStatus } from '../../../data/constants';

export const courseId = 'course-v1:edX+DemoX+Demo_Course';

export const initialState = {
  courseDetail: {
    courseId,
    status: 'sucessful',
  },
  videos: {
    videoIds: ['mOckID0'],
    pageSettings: {
      transcriptAvailableLanguages: [
        { languageCode: "ar", languageText: "Arabic" },
        { languageCode: "en", languageText: "English" },
        { languageCode: "fr", languageText: "French" },
      ],
      videoTranscriptSettings: {
          transcriptDownloadHandlerUrl: '/transcript_download/',
          transcriptUploadHandlerUrl: "/transcript_upload/",
          transcriptDeleteHandlerUrl: `/transcript_delete/${courseId}`,
      },
    },
    loadingStatus: RequestStatus.SUCCESSFUL,
    updatingStatus: '',
    addingStatus: '',
    deletingStatus: '',
    usageStatus: '',
    transcriptStatus: '',
    errors: {
      add: [],
      delete: [],
      thumbnail: [],
      download: [],
      usageMetrics: [],
      transcript: [],
    },
    totalCount: 0,
  },
  models: {
    videos: {
      mOckID0: {
        id: 'mOckID0',
        displayName: 'mOckID0.mp4',
        wrapperType: 'video',
        dateAdded: '',
        thumbnail: '/video',
        fileSize: null,
        edx_video_id: 'mOckID0',
        clientVideoId: 'mOckID0.mp4',
        created: '',
        courseVideoImageUrl: '/video',
        transcripts: [],
        status: 'Imported',
      },
    },
  },
};

export const generateFetchVideosApiResponse = () => ({
      "image_upload_url": "/video_images/course-v1:krisEdx+ka101+2023-01",
      "video_handler_url": "/videos/course-v1:krisEdx+ka101+2023-01",
      "encodings_download_url": "/video_encodings_download/course-v1:krisEdx+ka101+2023-01",
      "default_video_image_url": "/static/studio/images/video-images/default_video_image.png",
      "previous_uploads": [
        {
          edx_video_id: 'mOckID1',
          clientVideoId: 'mOckID1.mp4',
          created: '',
          courseVideoImageUrl: '/video',
          transcripts: [],
          status: 'Imported',
        },
        {
          edx_video_id: 'mOckID5',
          clientVideoId: 'mOckID5.mp4',
          created: '',
          courseVideoImageUrl: 'http:/video',
          transcripts: ['en'],
          status: 'Failed',
        },
        {
          edx_video_id: 'mOckID3',
          clientVideoId: 'mOckID3.mp4',
          created: '',
          courseVideoImageUrl: null,
          transcripts: ['en'],
          status: 'Ready',
        },
      ],
      "concurrent_upload_limit": 4,
      "video_supported_file_formats": [
          ".mp4",
          ".mov"
      ],
      "video_upload_max_file_size": "5",
      "video_image_settings": {
          "video_image_upload_enabled": true,
          "max_size": 2097152,
          "min_size": 2048,
          "max_width": 1280,
          "max_height": 720,
          "supported_file_formats": {
              ".bmp": "image/bmp",
              ".bmp2": "image/x-ms-bmp",
              ".gif": "image/gif",
              ".jpg": "image/jpeg",
              ".jpeg": "image/jpeg",
              ".png": "image/png"
          }
      },
      "is_video_transcript_enabled": true,
      "active_transcript_preferences": null,
      "transcript_credentials": {},
      "transcript_available_languages": [
          {
              "language_code": "ab",
              "language_text": "Abkhazian"
          },
      ],
      "video_transcript_settings": {
          "transcript_download_handler_url": "/transcript_download/",
          "transcript_upload_handler_url": "/transcript_upload/",
          "transcript_delete_handler_url": "/transcript_delete/course-v1:krisEdx+ka101+2023-01",
          "trancript_download_file_format": "srt",
          "transcript_preferences_handler_url": "/transcript_preferences/course-v1:krisEdx+ka101+2023-01",
          "transcript_credentials_handler_url": "/transcript_credentials/course-v1:krisEdx+ka101+2023-01",
          "transcription_plans": {
              "Cielo24": {
                  "display_name": "Cielo24",
                  "turnaround": {
                      "PRIORITY": "Priority (24 hours)",
                      "STANDARD": "Standard (48 hours)"
                  },
                  "fidelity": {
                      "MECHANICAL": {
                          "display_name": "Mechanical (75% accuracy)",
                          "languages": {
                              "nl": "Dutch",
                              "en": "English",
                              "fr": "French",
                          }
                      },
                      "PREMIUM": {
                          "display_name": "Premium (95% accuracy)",
                          "languages": {
                              "en": "English"
                          }
                      },
                      "PROFESSIONAL": {
                          "display_name": "Professional (99% accuracy)",
                          "languages": {
                              "ar": "Arabic",
                              "zh-tw": "Chinese - Mandarin (Traditional)",
                          }
                      }
                  }
              },
              "3PlayMedia": {
                  "display_name": "3Play Media",
                  "turnaround": {
                      "two_hour": "2 hours",
                      "same_day": "Same day",
                      "rush": "24 hours (rush)",
                      "expedited": "2 days (expedited)",
                      "standard": "4 days (standard)",
                      "extended": "10 days (extended)"
                  },
                  "languages": {
                      "en": "English",
                      "el": "Greek",
                      "zh": "Chinese",
                      "vi": "Vietnamese",
                  },
                  "translations": {
                      "es": [
                          "en"
                      ],
                      "en": [
                          "el",
                          "en",
                          "zh",
                          "vi",
                      ]
                  }
              }
          }
      },
      "pagination_context": {}
  }
);
export const generateAddVideoApiResponse = () => ({
  videos: [
    {
      edx_video_id: 'mOckID4',
      clientVideoId: 'mOckID4.mov',
      created: '',
      courseVideoImageUrl: null,
      transcripts: ['en'],
      status: 'Uploaded',
    },
  ],
});

export const generateEmptyApiResponse = () => ([{
  previousUploads: [],
}]);

export const generateNewVideoApiResponse = () => ({
  files: [{
    edx_video_id: 'mOckID4',
    upload_url: 'http://testing.org',
  }],
});

export const getStatusValue = (status) => {
  switch (status) {
  case RequestStatus.DENIED:
    return 403;
  default:
    return 200;
  }
};
