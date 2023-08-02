import { useEffect, useRef, useState } from 'react';
import { getGradingValues, getSortedGrades } from './grading-scale/utils';

const useConvertGradeCutoffs = (
  gradeCutoffs,
) => {
  const gradeLetters = gradeCutoffs && Object.keys(gradeCutoffs);
  const gradeValues = gradeCutoffs && getGradingValues(gradeCutoffs);
  const sortedGrades = gradeCutoffs && getSortedGrades(gradeValues);

  return {
    gradeLetters,
    gradeValues,
    sortedGrades,
  };
};

const useUpdateGradingData = (gradingSettingsData, setOverrideInternetConnectionAlert, setShowSuccessAlert) => {
  const [gradingData, setGradingData] = useState({});
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const resetDataRef = useRef(false);
  const {
    gradeCutoffs = {},
    gracePeriod = { hours: '', minutes: '' },
    minimumGradeCredit,
    graders,
  } = gradingData;

  useEffect(() => {
    if (gradingSettingsData !== undefined) {
      setGradingData(gradingSettingsData);
    }
  }, [gradingSettingsData]);

  const handleResetPageData = () => {
    setShowSavePrompt(!showSavePrompt);
    setShowSuccessAlert(false);
    setGradingData(gradingSettingsData);
    resetDataRef.current = true;
    setOverrideInternetConnectionAlert(false);
  };

  const handleAddAssignment = () => {
    setGradingData(prevState => ({
      ...prevState,
      graders: [...prevState.graders, {
        id: graders.length,
        dropCount: 0,
        minCount: 1,
        shortLabel: '',
        type: '',
        weight: 0,
      }],
    }));
    setShowSuccessAlert(false);
  };

  const handleRemoveAssignment = (assignmentId) => {
    setGradingData((prevState) => ({
      ...prevState,
      graders: prevState.graders.filter((grade) => grade.id !== assignmentId),
    }));
    setShowSuccessAlert(false);
    setShowSavePrompt(true);
  };

  return {
    graders,
    resetDataRef,
    setGradingData,
    gradingData,
    gradeCutoffs,
    gracePeriod,
    minimumGradeCredit,
    showSavePrompt,
    setShowSavePrompt,
    handleResetPageData,
    handleAddAssignment,
    handleRemoveAssignment,
  };
};

export { useConvertGradeCutoffs, useUpdateGradingData };
