import React from 'react';
import { Icon } from './Icon';
import type { IconProps } from './types';

type IndividualIconProps = Omit<IconProps, 'name'>;

export const Home: React.FC<IndividualIconProps> = (props) => <Icon name="Home" {...props} />;
export const Album: React.FC<IndividualIconProps> = (props) => <Icon name="Album" {...props} />;
export const Report: React.FC<IndividualIconProps> = (props) => <Icon name="Report" {...props} />;
export const Setting: React.FC<IndividualIconProps> = (props) => <Icon name="Setting" {...props} />;
export const Alarm: React.FC<IndividualIconProps> = (props) => <Icon name="Alarm" {...props} />;
export const Profile: React.FC<IndividualIconProps> = (props) => <Icon name="Profile" {...props} />;
export const Arrow: React.FC<IndividualIconProps> = (props) => <Icon name="Arrow" {...props} />;
export const Check: React.FC<IndividualIconProps> = (props) => <Icon name="Check" {...props} />;
export const Graph: React.FC<IndividualIconProps> = (props) => <Icon name="Graph" {...props} />;
export const Plus: React.FC<IndividualIconProps> = (props) => <Icon name="Plus" {...props} />;
export const Picture: React.FC<IndividualIconProps> = (props) => <Icon name="Picture" {...props} />;
export const Calendar: React.FC<IndividualIconProps> = (props) => <Icon name="Calendar" {...props} />;
export const Map: React.FC<IndividualIconProps> = (props) => <Icon name="Map" {...props} />;
export const People: React.FC<IndividualIconProps> = (props) => <Icon name="People" {...props} />;
export const Heart: React.FC<IndividualIconProps> = (props) => <Icon name="Heart" {...props} />;
export const Comment: React.FC<IndividualIconProps> = (props) => <Icon name="Comment" {...props} />;
export const More: React.FC<IndividualIconProps> = (props) => <Icon name="More" {...props} />;
export const Sent: React.FC<IndividualIconProps> = (props) => <Icon name="Sent" {...props} />;
export const Quiz: React.FC<IndividualIconProps> = (props) => <Icon name="Quiz" {...props} />;
export const Circle: React.FC<IndividualIconProps> = (props) => <Icon name="Circle" {...props} />;
