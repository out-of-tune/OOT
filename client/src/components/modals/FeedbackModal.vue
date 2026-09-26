<script setup lang="ts">
import { computed, ref } from "vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiModal from "@/components/ui/UiModal.vue";
import { useStore } from "@/store";

const store = useStore();
const open = computed(() => store.state.feedback.feedbackModalOpen);
const mail = ref("");
const feedback = ref("");
const sending = ref(false);
const submitted = ref(false);

/** An empty address is allowed: the feedback is then anonymous. */
const mailValid = computed(
  () =>
    mail.value.trim() === "" ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim()),
);
const feedbackValid = computed(() => feedback.value.trim().length > 0);

const close = () => store.dispatch("changeFeedbackModalState", false);

async function send() {
  submitted.value = true;
  if (!mailValid.value || !feedbackValid.value) return;
  sending.value = true;
  const sent = await store.dispatch("sendFeedback", {
    mail: mail.value.trim() || undefined,
    feedback: feedback.value.trim(),
    group: "beta-tester",
  });
  sending.value = false;
  if (sent) {
    feedback.value = "";
    submitted.value = false;
    close();
  }
}
</script>

<template>
  <UiModal :open="open" title="Send feedback" @close="close">
    <form
      id="feedback-form"
      class="flex flex-col gap-4"
      novalidate
      @submit.prevent="send"
    >
      <p class="text-sm text-fg-muted">
        Found a bug or have an idea? We read every message.
      </p>
      <label class="flex flex-col gap-1.5">
        <span class="label">E-mail (optional)</span>
        <input
          v-model="mail"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          class="field"
          :aria-invalid="submitted && !mailValid"
        />
        <span v-if="submitted && !mailValid" class="text-xs text-danger"
          >Enter a valid e-mail address.</span
        >
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="label">Feedback</span>
        <textarea
          v-model="feedback"
          rows="5"
          class="field h-auto resize-y py-2"
          placeholder="What should we know?"
          :aria-invalid="submitted && !feedbackValid"
        />
        <span v-if="submitted && !feedbackValid" class="text-xs text-danger"
          >Write some feedback first.</span
        >
      </label>
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="close">Cancel</UiButton>
      <UiButton
        type="submit"
        form="feedback-form"
        variant="primary"
        :disabled="sending"
      >
        {{ sending ? "Sending…" : "Send" }}
      </UiButton>
    </template>
  </UiModal>
</template>
