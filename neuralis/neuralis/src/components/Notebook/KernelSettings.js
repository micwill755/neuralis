import React, { useState } from 'react';
import styled from 'styled-components';
import KernelManager from './KernelManager';

const SettingsContainer = styled.div`
  padding: 20px;
  background-color: white;
  height: 100%;
  overflow: auto;
`;

const Title = styled.h2`
  margin-top: 0;
  margin-bottom: 20px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
`;

const InfoText = styled.p`
  margin-bottom: 15px;
  color: #666;
`;

const KernelSettings = ({ onClose }) => {
  const [containerCreated, setContainerCreated] = useState(false);
  
  const handleContainerCreated = (container) => {
    setContainerCreated(true);
  };
  
  return (
    <SettingsContainer>
      <Title>Kernel Settings</Title>
      
      <Section>
        <SectionTitle>Docker-based Python Kernels</SectionTitle>
        <InfoText>
          Create and manage Python kernels running in Docker containers.
          These kernels can be used to execute code in your notebooks.
        </InfoText>
        
        <KernelManager onKernelContainerCreated={handleContainerCreated} />
      </Section>
      
      {containerCreated && (
        <Section>
          <SectionTitle>Success!</SectionTitle>
          <InfoText>
            Kernel container created successfully. You can now select this kernel
            in your notebook using the kernel selector at the top of the notebook.
          </InfoText>
          
          <button onClick={onClose}>Close Settings</button>
        </Section>
      )}
    </SettingsContainer>
  );
};

export default KernelSettings;
