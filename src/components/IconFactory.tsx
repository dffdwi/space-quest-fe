import React from "react";
import { FaPalette, FaStar, FaFlask, FaGift } from "react-icons/fa";

const iconMap: { [key: string]: React.ElementType } = {
  FaPalette,
  FaStar,
  FaFlask,
  FaGift,
};

interface IconFactoryProps {
  iconName?: string;
  className?: string;
}

const IconFactory: React.FC<IconFactoryProps> = ({ iconName, className }) => {
  if (!iconName || !iconMap[iconName]) {
    return <FaGift className={className} />;
  }

  const IconComponent = iconMap[iconName];
  return <IconComponent className={className} />;
};

export default IconFactory;
