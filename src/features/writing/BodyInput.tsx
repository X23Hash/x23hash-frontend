import { tokens as t, type } from "@/theme/tokens";
import { TextInput } from "react-native";
import { limitBody } from "./body-rules";
import { useWritingSession } from "./writing-session";
// 02.03 안내 문구와 02.05 빈 글 오류 문구. 오류일 때는 테두리를 붉게, 문구를 밝게 보입니다.
const placeholder = "그때 하지 못한 말,\n지금 남기고 싶은 말…";
const emptyMessage = "남길 말을 입력해 주세요.";
export function BodyInput({ error = false }: { error?: boolean }) {
  const { draft, update } = useWritingSession();
  return (
    <TextInput
      accessibilityLabel="남길 말"
      multiline
      scrollEnabled
      value={draft.body}
      onChangeText={(body) => update({ body: limitBody(body) })}
      selection={draft.selection}
      onSelectionChange={(event) =>
        update({ selection: event.nativeEvent.selection })
      }
      placeholder={error ? emptyMessage : placeholder}
      placeholderTextColor={error ? t.text : t.muted}
      style={{
        height: 240,
        padding: 20,
        borderWidth: 1,
        borderColor: error ? t.danger : t.line,
        borderRadius: 20,
        backgroundColor: t.surface,
        color: t.text,
        ...type.body,
      }}
      textAlignVertical="top"
    />
  );
}
