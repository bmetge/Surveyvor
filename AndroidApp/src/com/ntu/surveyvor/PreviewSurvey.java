package com.ntu.surveyvor;

import android.os.Bundle;
import android.app.Activity;
import android.content.Intent;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TextView;
import android.support.v4.app.NavUtils;

public class PreviewSurvey extends Activity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_preview_survey);
        //getActionBar().setDisplayHomeAsUpEnabled(true);
        

        // Get the message from the intent
        Intent intent = getIntent();
        String surveyID = intent.getStringExtra("surveyID");

        // Create the text view
        TextView textView = new TextView(this);
        textView.setText("This is the preview page for Survey ID " + surveyID);

        // Set the text view as the activity layout
        setContentView(textView);
        
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_preview_survey, menu);
        return true;
    }

    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case android.R.id.home:
                NavUtils.navigateUpFromSameTask(this);
                return true;
        }
        return super.onOptionsItemSelected(item);
    }

}
