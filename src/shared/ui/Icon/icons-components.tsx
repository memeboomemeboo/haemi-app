import React from 'react';
import { Icon } from './Icon';
import type { IconProps } from './types';

type IndividualIconProps = Omit<IconProps, 'name'>;

export const Home: React.FC<IndividualIconProps> = (props) => <Icon name="Home" {...props} />;
export const Album: React.FC<IndividualIconProps> = (props) => <Icon name="Album" {...props} />;
export const Heart: React.FC<IndividualIconProps> = (props) => <Icon name="Heart" {...props} />;
export const Report: React.FC<IndividualIconProps> = (props) => <Icon name="Report" {...props} />;
export const Quiz: React.FC<IndividualIconProps> = (props) => <Icon name="Quiz" {...props} />;
export const Alarm: React.FC<IndividualIconProps> = (props) => <Icon name="Alarm" {...props} />;
export const Setting: React.FC<IndividualIconProps> = (props) => <Icon name="Setting" {...props} />;
export const Profile: React.FC<IndividualIconProps> = (props) => <Icon name="Profile" {...props} />;
export const Arrow: React.FC<IndividualIconProps> = (props) => <Icon name="Arrow" {...props} />;
export const Check: React.FC<IndividualIconProps> = (props) => <Icon name="Check" {...props} />;
