import React from "react";
import {
  FaPalette,
  FaStar,
  FaFlask,
  FaGift,
  FaCalendarCheck,
  FaGraduationCap,
  FaRegLightbulb,
  FaSpaceShuttle,
  FaUserAstronaut,
} from "react-icons/fa";

export const iconMap: { [key: string]: React.ElementType } = {
  FaPalette,
  FaStar,
  FaFlask,
  FaGift,
  FaRegLightbulb,
  FaSpaceShuttle,
  FaUserAstronaut,
  FaGraduationCap,
  FaCalendarCheck,
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
