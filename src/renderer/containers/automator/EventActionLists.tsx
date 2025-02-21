import styled from "@emotion/styled";
import type { Action } from "@vinceau/event-actions";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";

import { actionComponents } from "@/containers/actions";
import { generateEventName } from "@/lib/events";
import type { Dispatch, iRootState } from "@/store";

import { ActionInput, AddActionInput } from "./ActionInputs";
import { EventItem } from "./EventItem";

const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  font-size: 1.6rem;
  background-color: ${(props) => props.theme.foreground3};
  text-align: center;
  padding: 0.5rem 0;
  h2 {
    display: inline;
    margin-right: 1rem;
  }
`;

const EventName = styled.div`
  margin: 2.5rem;
  font-size: 1.8rem;
  font-weight: 600;
`;

const ColumnContent = styled.div`
  overflow: hidden;
  overflow-y: auto;
  position: relative;
  height: 100%;
  width: 100%;
`;

const ColumnInner = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`;

export interface EventActionListsProps {
  selected: number;
  onSelect: (i: number) => void;
}

export const EventActionLists: React.FC<EventActionListsProps> = (props) => {
  const { selected, onSelect } = props;
  const val = useSelector((state: iRootState) => state.automator.events);
  const actions = useSelector((state: iRootState) => state.automator.actions);
  const dispatch = useDispatch<Dispatch>();
  const selectedEvent = val[selected];
  const selectedEventName = selectedEvent.name ? selectedEvent.name : generateEventName(selectedEvent) + "...";
  const selectedActions = selectedEvent ? actions[selectedEvent.id] || [] : [];
  const disabledActions = selectedActions.map((a) => a.name);
  const onActionChange = (index: number, action: Action) => {
    const eventId = selectedEvent.id;
    dispatch.automator.updateActionEvent({ eventId, index, action });
  };
  const onActionRemove = (index: number) => {
    const eventId = selectedEvent.id;
    dispatch.automator.removeActionEvent({ eventId, index });
  };
  const onActionAdd = (name: string) => {
    const eventId = selectedEvent.id;
    const params = actionComponents[name].defaultParams;
    const action = {
      name,
      args: params ? params() : {},
    };
    dispatch.automator.addNewEventAction({ eventId, action });
  };
  return (
    <ReflexContainer orientation="vertical">
      <ReflexElement>
        <ColumnContent>
          <ColumnInner>
            <Header>
              <h2>Events</h2>
            </Header>
            <div>
              {val.map((e, i) => {
                return (
                  <EventItem
                    key={e.id}
                    selected={selected === i}
                    disabled={e.disabled}
                    onClick={() => onSelect(i)}
                    event={e}
                  />
                );
              })}
            </div>
          </ColumnInner>
        </ColumnContent>
      </ReflexElement>

      <ReflexSplitter />

      <ReflexElement>
        <ColumnContent>
          <ColumnInner>
            <Header>
              <h2>Actions</h2>
            </Header>
            <EventName>{selectedEventName}</EventName>
            <div>
              {selectedActions.map((a, i) => {
                const onInnerActionChange = (newVal: Action) => {
                  onActionChange(i, newVal);
                };
                const prefix = i === 0 ? "Then " : "And ";
                return (
                  <ActionInput
                    key={`${selectedEvent.id}--${a.name}`}
                    selectPrefix={prefix}
                    value={a}
                    onChange={onInnerActionChange}
                    disabledActions={[]}
                    onRemove={() => onActionRemove(i)}
                  />
                );
              })}
              <AddActionInput onChange={onActionAdd} disabledActions={disabledActions} />
            </div>
          </ColumnInner>
        </ColumnContent>
      </ReflexElement>
    </ReflexContainer>
  );
};
